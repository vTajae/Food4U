import assert from "node:assert/strict";
import { AsyncLocalStorage } from "node:async_hooks";
import { readFile } from "node:fs/promises";
import { registerHooks } from "node:module";
import { test } from "node:test";
import React from "react";
import { env } from "cloudflare:workers";
import type { SessionData } from "../lib/session.ts";

// Keep the real pages/actions, auth gate and backend services. Replace only the
// framework session/navigation and leaf UI boundaries in this Node runner.
const requests = new AsyncLocalStorage<{ id: string; data: SessionData; onCommit?: () => Promise<void> }>();
Object.assign(globalThis, { tokenTestRequests: requests, React });
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    let source: string | undefined;
    if (specifier === "~/lib/session") source = `
      export async function getSession() { return globalThis.tokenTestRequests.getStore(); }
      export async function commitSession() { await globalThis.tokenTestRequests.getStore().onCommit?.(); }
    `;
    if (specifier === "next/navigation") source = `
      export function redirect(path) { throw new Error("REDIRECT:" + path); }
    `;
    if (specifier === "~/components/ask/ask-screen") source = "export function AskScreen() {}";
    if (specifier === "~/components/shell/backend-unavailable") source = "export function BackendUnavailable() {}";
    if (source) return { url: `data:text/javascript,${encodeURIComponent(source)}`, shortCircuit: true };
    return nextResolve(specifier, context);
  },
});
const { default: dashboard } = await import("../app/(app)/dashboard/page.tsx");
const { submitWelcome } = await import("../app/(app)/welcome/actions.ts");
const { POST: clinicals } = await import("../app/api/clinicals/route.ts");
const { GET: refs } = await import("../app/api/refs/route.ts");
const { POST: suggestion } = await import("../app/api/suggestion/route.ts");
hooks.deregister();

const payload = { submission: [{ questionId: 5555, queryKey: "diets" as const, answers: [{ name: "Vegetarian" }] }] };
const profile = { attributes: [], diets: [{ diet_type: { diet_name: "Vegetarian" } }] };
const missing = () => Response.json({ detail: "User not found" }, { status: 403 });
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(done => { resolve = done; });
  return { promise, resolve };
}
function asRequest<T>(id: string, token: string | undefined, action: () => T): T {
  return requests.run({ id, data: { auth: { id: 1 } as SessionData["auth"], token } }, action);
}
type Call = { owner: string; path: string; bearer: string | null };
async function withFetch(action: (calls: Call[], install: (reply: (call: Call) => Promise<Response> | Response) => void) => Promise<void>) {
  const original = globalThis.fetch;
  const calls: Call[] = [];
  try {
    await action(calls, reply => {
      globalThis.fetch = (async (input, init) => {
        const call = { owner: requests.getStore()!.id, path: new URL(String(input)).pathname, bearer: new Headers(init?.headers).get("Authorization") };
        calls.push(call);
        return reply(call);
      }) as typeof fetch;
    });
  } finally { globalThis.fetch = original; }
}
function assertBearers(calls: Call[], expected: Record<string, string | null>) {
  for (const call of calls) assert.equal(call.bearer, expected[call.owner], `${call.owner} ${call.path}`);
}

test("dashboard ensure/retry keeps A's bearer while B completes in the same isolate", { timeout: 5000 }, async () => {
  await withFetch(async (calls, install) => {
    const entered = deferred<void>(), paused = deferred<Response>();
    install(call => {
      if (call.owner === "A" && calls.filter(c => c.owner === "A").length === 1) {
        entered.resolve(); return paused.promise;
      }
      return Response.json(call.path === "/profile" ? { id: 7 } : profile);
    });
    const a = asRequest("A", "A", dashboard);
    await entered.promise;
    await asRequest("B", "B", dashboard);
    paused.resolve(missing());
    await a;
    assert.deepEqual(calls.filter(c => c.owner === "A").map(c => c.path), ["/user/profile", "/profile", "/user/profile"]);
    assert.deepEqual(calls.filter(c => c.owner === "B").map(c => c.path), ["/user/profile"]);
    assertBearers(calls, { A: "Bearer A", B: "Bearer B" });
  });
});

test("welcome ensure/retry keeps A's bearer while B submits welcome", { timeout: 5000 }, async () => {
  await withFetch(async (calls, install) => {
    const entered = deferred<void>(), paused = deferred<Response>();
    install(call => {
      if (call.owner === "A" && calls.filter(c => c.owner === "A").length === 1) {
        entered.resolve(); return paused.promise;
      }
      return Response.json(call.path === "/profile" ? { id: 7 } : { status: true, message: "Saved" });
    });
    const a = asRequest("A", "A", () => assert.rejects(submitWelcome(payload), { message: "REDIRECT:/dashboard" }));
    await entered.promise;
    await asRequest("B", "B", () => assert.rejects(submitWelcome(payload), { message: "REDIRECT:/dashboard" }));
    paused.resolve(missing());
    await a;
    assert.deepEqual(calls.filter(c => c.owner === "A").map(c => c.path), ["/welcome", "/profile", "/welcome"]);
    assert.deepEqual(calls.filter(c => c.owner === "B").map(c => c.path), ["/welcome"]);
    assertBearers(calls, { A: "Bearer A", B: "Bearer B" });
  });
});

test("dashboard retry uses its refreshed token even when B runs during session commit", { timeout: 5000 }, async () => {
  const saved = { db: env.cloudflare_db, secret: env.JWT_SECRET_KEY, expiry: env.JWT_ACCESS_TOKEN_EXPIRE_MINUTES };
  const entered = deferred<void>(), paused = deferred<void>();
  const session = { id: "A", data: { auth: { id: 1 } as SessionData["auth"], token: "expired-A" }, onCommit: async () => { entered.resolve(); await paused.promise; } };
  env.JWT_SECRET_KEY = "synthetic-test-secret";
  env.JWT_ACCESS_TOKEN_EXPIRE_MINUTES = "30m";
  env.cloudflare_db = { prepare: () => ({ bind: () => ({ all: async () => ({ results: [{ public_id: "public-A", username: "A", user_role: "2" }] }) }) }) } as unknown as D1Database;
  try {
    await withFetch(async (calls, install) => {
      install(call => call.bearer === "Bearer expired-A"
        ? Response.json({ detail: "Token has expired" }, { status: 403 })
        : Response.json(profile));
      const a = requests.run(session, dashboard);
      await entered.promise;
      await asRequest("B", "B", dashboard);
      paused.resolve();
      await a;
      assert.notEqual(session.data.token, "expired-A");
      assert.deepEqual(calls.filter(c => c.owner === "A").map(c => c.bearer), ["Bearer expired-A", `Bearer ${session.data.token}`]);
      assert.equal(calls.find(c => c.owner === "B")?.bearer, "Bearer B");
    });
  } finally {
    env.cloudflare_db = saved.db; env.JWT_SECRET_KEY = saved.secret; env.JWT_ACCESS_TOKEN_EXPIRE_MINUTES = saved.expiry;
  }
});

for (const route of ["refs", "suggestion"]) test(`${route} uses its request bearer across concurrent backend calls`, { timeout: 5000 }, async () => {
  await withFetch(async (calls, install) => {
    const entered = deferred<void>(), paused = deferred<Response>();
    install(call => {
      if (call.owner === "A") { entered.resolve(); return paused.promise; }
      return Response.json(route === "refs" ? [] : { status: true, result: {} });
    });
    const invoke = () => {
      if (route === "refs") return refs(new Request("http://local/api/refs?query=v&type=diets"));
      const form = new FormData();
      for (const [key, value] of Object.entries({ action: "meal", queryKey: "diets", query: "vegetarian" })) form.set(key, value);
      return suggestion(new Request("http://local/api/suggestion", { method: "POST", body: form }));
    };
    const a = asRequest("A", "A", invoke);
    await entered.promise;
    assert.equal((await asRequest("B", "B", invoke)).status, 200);
    paused.resolve(Response.json(route === "refs" ? [] : { status: true, result: {} }));
    assert.equal((await a).status, 200);
    assert.equal(calls.length, 2);
    assertBearers(calls, { A: "Bearer A", B: "Bearer B" });
  });
});

// Clinical consider really awaits formData after reading the session. Cover
// both a tokenless session and an authenticated A across that boundary.
for (const token of [undefined, "A"]) test(`clinical formData await isolates ${token ?? "no token"} from B`, { timeout: 5000 }, async () => {
  await withFetch(async (calls, install) => {
    install(() => Response.json({ status: true }));
    const entered = deferred<void>(), paused = deferred<FormData>();
    const form = new FormData();
    for (const [key, value] of Object.entries({ action: "consider", key: "conditions", code: "E11", description: "Diabetes" })) form.set(key, value);
    const request = { formData: () => { entered.resolve(); return paused.promise; } } as Request;
    const a = asRequest("A", token, () => clinicals(request));
    await entered.promise;
    const b = await asRequest("B", "B", () => clinicals({ formData: async () => form } as Request));
    paused.resolve(form);
    assert.equal(b.status, 200);
    assert.equal((await a).status, 200);
    assert.deepEqual(calls.map(c => [c.owner, c.path]), [["B", "/user/medical"], ["A", "/user/medical"]]);
    assertBearers(calls, { A: token ? "Bearer A" : null, B: "Bearer B" });
  });
});

test("backend services expose no isolate-global token setters or storage", async () => {
  for (const path of ["baseService", "profileService", "userService"]) {
    const source = await readFile(new URL(`../api/services/${path}.ts`, import.meta.url), "utf8");
    assert.doesNotMatch(source, /static\s+token\b|\b(?:setToken|clearToken|getToken)\s*\(/, path);
  }
});
