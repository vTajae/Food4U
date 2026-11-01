import assert from "node:assert/strict";
import { AsyncLocalStorage } from "node:async_hooks";
import { registerHooks } from "node:module";
import { test } from "node:test";
import { env } from "cloudflare:workers";
import type { SessionData } from "../lib/session.ts";
import SuggestionService from "../api/services/suggestionService.ts";
import { ApiError } from "../api/services/baseService.ts";

const sessions = new AsyncLocalStorage<{ id: string; data: SessionData; commits: number }>();
Object.assign(globalThis, { suggestionSessions: sessions });
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "~/lib/session") return { shortCircuit: true, url: `data:text/javascript,${encodeURIComponent(`
      export async function getSession() { return globalThis.suggestionSessions.getStore(); }
      export async function commitSession() { globalThis.suggestionSessions.getStore().commits++; }
    `)}` };
    return nextResolve(specifier, context);
  },
});
const { POST } = await import("../app/api/suggestion/route.ts");
hooks.deregister();
const waking = "The server is waking up. This can take up to a minute on first visit. Please try again shortly.";
function invoke() {
  const body = new FormData();
  for (const [key, value] of Object.entries({ action: "meal", queryKey: "general", query: "lunch" })) body.set(key, value);
  return POST(new Request("http://local/api/suggestion", { method: "POST", body }));
}
function session(token = "A") { return { id: token, data: { auth: { id: 1 } as SessionData["auth"], token }, commits: 0 }; }
async function withFetch(reply: typeof fetch, run: () => Promise<void>) {
  const original = globalThis.fetch;
  globalThis.fetch = reply;
  try { await run(); } finally { globalThis.fetch = original; }
}
for (const [name, reply, status, error, retryable] of [
  ["not configured", () => Response.json({ detail: "AI suggestions are not configured" }, { status: 503 }), 503, "Meal ideas aren't available yet. We're setting this up.", false],
  ...[502, 503, 504].map(code => [`waking ${code}`, () => new Response("waking", { status: code }), 503, waking, true]),
  ["timeout", () => { throw new DOMException("timeout", "TimeoutError"); }, 503, waking, true],
  ["network", () => { throw new TypeError("fetch failed"); }, 503, waking, true],
  ["busy", () => new Response("busy", { status: 429 }), 429, "Too many requests, try again in a moment", true],
  ["generic", () => Response.json({ detail: "private error" }, { status: 500 }), 500, "Couldn't get meal ideas. Please try again.", true],
] as [string, () => Response, number, string, boolean][]) test(`suggestion route maps ${name} without an empty success`, async () => {
  await withFetch(async () => reply(), async () => {
    const response = await sessions.run(session(), invoke);
    assert.equal(response.status, status);
    assert.deepEqual(await response.json(), { error, retryable });
  });
});
test("suggestion service propagates backend failure", async () => {
  await withFetch(async () => new Response("busy", { status: 429 }), async () => {
    await assert.rejects(new SuggestionService("A").GeneralSuggestion({ action: "meal", queryKey: "general", text: "lunch" }), error => error instanceof ApiError && error.status === 429);
  });
});
test("real empty suggestion response stays successful", async () => {
  await withFetch(async () => Response.json({ status: true, result: [] }), async () => {
    const response = await sessions.run(session(), invoke);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { message: "Suggestion fetched", meal: [] });
  });
});
for (const expireAgain of [false, true]) test(`expired token refresh is request local and bounded (repeat=${expireAgain})`, async () => {
  const saved = { db: env.cloudflare_db, secret: env.JWT_SECRET_KEY, expiry: env.JWT_ACCESS_TOKEN_EXPIRE_MINUTES };
  let lookups = 0;
  env.JWT_SECRET_KEY = "synthetic-suggestion-secret";
  env.JWT_ACCESS_TOKEN_EXPIRE_MINUTES = "30m";
  env.cloudflare_db = { prepare: () => ({ bind: () => ({ all: async () => { lookups++; return { results: [{ public_id: "public-A", username: "A", user_role: "2" }] }; } }) }) } as unknown as D1Database;
  const a = session("expired-A");
  const calls: string[] = [];
  try {
    await withFetch(async (_input, init) => {
      const bearer = new Headers(init?.headers).get("Authorization")!;
      calls.push(bearer);
      if (bearer === "Bearer expired-A" || (expireAgain && bearer !== "Bearer B")) return Response.json({ detail: "Token has expired" }, { status: 403 });
      return Response.json({ status: true, result: [] });
    }, async () => {
      const [response, b] = await Promise.all([sessions.run(a, invoke), sessions.run(session("B"), invoke)]);
      assert.equal(response.status, expireAgain ? 500 : 200);
      assert.equal(b.status, 200);
      assert.equal(lookups, 1);
      assert.equal(a.commits, 1);
      assert.notEqual(a.data.token, "expired-A");
      assert.equal(calls.length, 3);
      assert.ok(calls.includes(`Bearer ${a.data.token}`));
      assert.ok(calls.includes("Bearer B"));
    });
  } finally { env.cloudflare_db = saved.db; env.JWT_SECRET_KEY = saved.secret; env.JWT_ACCESS_TOKEN_EXPIRE_MINUTES = saved.expiry; }
});

for (const [name, payload] of [
  ["explicit failure", { status: false, result: [] }],
  ["missing result", { status: true }],
  ["nonarray result", { status: true, result: {} }],
  ["null envelope", null],
  ["missing status", { result: [] }],
] as [string, unknown][]) test(`suggestion rejects ${name} instead of displaying no matches`, async () => {
  await withFetch(async () => Response.json(payload), async () => {
    const response = await sessions.run(session(), invoke);
    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), { error: "Couldn't get meal ideas. Please try again.", retryable: true });
    await assert.rejects(new SuggestionService("A").GeneralSuggestion({ action: "meal", queryKey: "general", text: "lunch" }));
  });
});
test("unauthenticated suggestion retains exact contract and never contacts backend", async () => {
  await withFetch(async () => { assert.fail("must not contact backend"); }, async () => {
    const response = await sessions.run({ id: "anonymous", data: {}, commits: 0 }, invoke);
    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), { error: "Please log in." });
  });
});
