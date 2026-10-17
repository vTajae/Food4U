import assert from "node:assert/strict";
import { AsyncLocalStorage } from "node:async_hooks";
import { registerHooks } from "node:module";
import { test } from "node:test";
import { env } from "cloudflare:workers";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { SessionData } from "../lib/session.ts";

const waking = "The server is waking up. This can take up to a minute on first visit. Please try again shortly.";
const sessions = new AsyncLocalStorage<{ id: string; data: SessionData }>();
Object.assign(globalThis, { coldStartSessions: sessions, React });
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    let source: string | undefined;
    if (specifier === "~/lib/session") source = `
      export async function getSession() { return globalThis.coldStartSessions.getStore(); }
      export async function commitSession() {}
    `;
    if (specifier === "next/navigation") source = `export function redirect(path) { throw new Error("REDIRECT:" + path); }`;
    if (specifier === "~/components/ask/ask-screen") source = `export function AskScreen() { return "Dashboard ready"; }`;
    if (source) return { url: `data:text/javascript,${encodeURIComponent(source)}`, shortCircuit: true };
    return nextResolve(specifier, context);
  },
});
const { default: dashboard } = await import("../app/(app)/dashboard/page.tsx");
const { submitWelcome } = await import("../app/(app)/welcome/actions.ts");
hooks.deregister();

const payload = { submission: [{ questionId: 5555, queryKey: "diets" as const, answers: [{ name: "Vegetarian" }] }] };
function inSession<T>(action: () => T): T {
  return sessions.run({ id: "cold-start", data: { auth: { id: 1 } as SessionData["auth"], token: "test-only" } }, action);
}
async function withBackend(reply: () => Response | Promise<Response>, check: (paths: string[]) => Promise<void>) {
  const original = globalThis.fetch;
  const paths: string[] = [];
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    paths.push(new URL(String(input)).pathname);
    return reply();
  }) as typeof fetch;
  try { await check(paths); }
  finally { globalThis.fetch = original; }
}

for (const [name, reply] of [
  ["timeout", () => { throw new DOMException("Timed out", "TimeoutError"); }],
  ["abort", () => { throw new DOMException("Aborted", "AbortError"); }],
  ["network failure", () => { throw new TypeError("fetch failed"); }],
  ["workerd network loss", () => { throw new Error("Network connection lost."); }],
  ["connection refused", () => { throw Object.assign(new Error("connect failed"), { code: "ECONNREFUSED" }); }],
  ["connection reset", () => { throw Object.assign(new Error("connect failed"), { code: "ECONNRESET" }); }],
  ...[502, 503, 504].map(status => [String(status), () => new Response("Render waking", { status })]),
] as [string, () => Response][]) {
  test(`dashboard ${name} explains the cold start and offers a reload retry`, async () => {
    await withBackend(reply, async paths => {
      const html = renderToStaticMarkup(await inSession(dashboard));
      assert.ok(html.includes(waking), html);
      assert.match(html, /href="\/dashboard"[^>]*>Try again<\/a>/);
      assert.deepEqual(paths, ["/user/profile"]);
    });
  });
  test(`welcome ${name} explains the cold start without marking onboarding complete`, async () => {
    await withBackend(reply, async paths => {
      assert.deepEqual(await inSession(() => submitWelcome(payload)), { ok: false, message: waking, waking: true });
      assert.deepEqual(paths, ["/welcome"]);
    });
  });
}

for (const status of [401, 403, 404]) {
  test(`dashboard ${status} retains its existing unavailable behaviour`, async () => {
    await withBackend(() => Response.json({ detail: "Access denied" }, { status }), async paths => {
      const html = renderToStaticMarkup(await inSession(dashboard));
      assert.ok(!html.includes(waking));
      assert.ok(html.includes(`HTTP ${status}`));
      assert.deepEqual(paths, ["/user/profile"]);
    });
  });
  test(`welcome ${status} retains the existing error without ensure/retry`, async () => {
    await withBackend(() => Response.json({ detail: "Access denied" }, { status }), async paths => {
      assert.deepEqual(await inSession(() => submitWelcome(payload)), { ok: false, message: "Couldn't save your profile. Please try again." });
      assert.deepEqual(paths, ["/welcome"]);
    });
  });
}

test("dashboard reports waking when missing-profile ensure fails with 503", async () => {
  let count = 0;
  await withBackend(() => ++count === 1
    ? Response.json({ detail: "User not found" }, { status: 403 })
    : new Response("Render waking", { status: 503 }), async paths => {
    assert.ok(renderToStaticMarkup(await inSession(dashboard)).includes(waking));
    assert.deepEqual(paths, ["/user/profile", "/profile"]);
  });
});

test("dashboard retry after waking renders the profile", async () => {
  await withBackend(() => Response.json({ attributes: [], diets: [{ diet_type: { diet_name: "Vegetarian" } }] }), async paths => {
    assert.equal(renderToStaticMarkup(await inSession(dashboard)), "Dashboard ready");
    assert.deepEqual(paths, ["/user/profile"]);
  });
});

for (const [name, reply, awake] of [
  ["healthy", () => Response.json({ status: "ok" }), true],
  ["timeout", () => { throw new DOMException("Timed out", "TimeoutError"); }, false],
  ["503", () => new Response("Render waking", { status: 503 }), false],
  ["workerd network loss", () => { throw new Error("Network connection lost."); }, false],
  ["connection refused", () => { throw Object.assign(new Error("connect failed"), { code: "ECONNREFUSED" }); }, false],
  ["connection reset", () => { throw Object.assign(new Error("connect failed"), { code: "ECONNRESET" }); }, false],
] as [string, () => Response, boolean][]) test(`/api/wake ${name} returns an anonymous uncached status without throwing`, async () => {
  const { GET } = await import("../app/api/wake/route.ts");
  const original = globalThis.fetch;
  const originalLog = console.error;
  const logs: unknown[][] = [];
  console.error = (...args: unknown[]) => { logs.push(args); };
  const realTimeout = AbortSignal.timeout;
  const timeouts: number[] = [];
  AbortSignal.timeout = (ms: number) => { timeouts.push(ms); return realTimeout(ms); };
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    assert.equal(String(input), "http://127.0.0.1:8765/health");
    assert.equal(new Headers(init?.headers).get("Authorization"), null);
    assert.ok(init?.signal);
    return reply();
  }) as typeof fetch;
  try {
    const response = await GET();
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("Cache-Control"), "no-store");
    assert.deepEqual(await response.json(), { awake });
    assert.deepEqual(timeouts, [60_000]);
    assert.deepEqual(logs, [], "expected transport failures must not log an unexpected-error diagnostic");
  } finally { globalThis.fetch = original; AbortSignal.timeout = realTimeout; console.error = originalLog; }
});

test("client wake fires once per document and never blocks auth on a failed wake", async () => {
  const { wakeBackend } = await import("../lib/wake-backend.ts");
  const original = globalThis.fetch;
  let calls = 0;
  let reject!: (error: Error) => void;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls++;
    assert.equal(input, "/api/wake");
    assert.equal(init?.credentials, "omit");
    assert.equal(init?.cache, "no-store");
    return new Promise<Response>((_, fail) => { reject = fail; });
  }) as typeof fetch;
  try {
    const first = wakeBackend();
    assert.equal(wakeBackend(), first);
    assert.equal(calls, 1);
    reject(new TypeError("fetch failed"));
    await first;
    await wakeBackend();
    assert.equal(calls, 1);
  } finally { globalThis.fetch = original; }
});

test("wake configuration failure remains non-throwing but emits a secret-free diagnostic", async () => {
  const { GET } = await import("../app/api/wake/route.ts");
  const original = env.API_BASE_URL;
  const originalLog = console.error;
  const logs: unknown[][] = [];
  console.error = (...args: unknown[]) => { logs.push(args); };
  env.API_BASE_URL = "not-an-api-url-with-private-content";
  try {
    assert.deepEqual(await (await GET()).json(), { awake: false });
    assert.deepEqual(logs, [["Backend wake failed unexpectedly"]]);
  } finally { env.API_BASE_URL = original; console.error = originalLog; }
});
