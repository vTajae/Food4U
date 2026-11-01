import assert from "node:assert/strict";
import { test } from "node:test";
import { ApiError } from "../api/services/baseService.ts";
import ProfileService from "../api/services/profileService.ts";

const backend = new ProfileService("original-request-token");
const payload = { submission: [{ questionId: 5, queryKey: "cuisines" as const, answers: [{ name: "Italian" }] }] };
const missing = { status: 403, body: { detail: "User not found" } };
const success = { status: 200, body: { status: true, message: "Saved" } };
type Reply = { status: number; body: unknown } | Error;

async function withReplies(replies: Reply[], check: (calls: { path: string; method: string; body: unknown; bearer: string | null }[]) => Promise<void>) {
  const original = globalThis.fetch;
  const calls: { path: string; method: string; body: unknown; bearer: string | null }[] = [];
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ path: new URL(String(input)).pathname, method: init?.method || "GET", body: init?.body ? JSON.parse(String(init.body)) : undefined, bearer: new Headers(init?.headers).get("Authorization") });
    const reply = replies.shift();
    assert.ok(reply, "no unexpected backend call");
    if (reply instanceof Error) throw reply;
    return Response.json(reply.body, { status: reply.status });
  }) as typeof fetch;
  try { await check(calls); assert.equal(replies.length, 0); }
  finally { globalThis.fetch = original; }
  for (const call of calls) { assert.equal(call.method, "POST"); assert.equal(call.bearer, "Bearer original-request-token"); assert.deepEqual(call.body, call.path === "/profile" ? undefined : payload); }
}

test("missing profile is ensured once and welcome is retried with the same request bearer", async () => {
  await withReplies([missing, { status: 200, body: { id: 7 } }, success], async calls => {
    assert.deepEqual(await backend.submitWelcomeProfile(payload), success.body);
    assert.deepEqual(calls.map(call => call.path), ["/welcome", "/profile", "/welcome"]);
  });
});

test("expired token is rejected after one welcome call without ensure", async () => {
  await withReplies([{ status: 403, body: { detail: "Token has expired" } }], async calls => {
    await assert.rejects(backend.submitWelcomeProfile(payload), error => error instanceof ApiError && error.status === 403 && error.detail === "Token has expired");
    assert.deepEqual(calls.map(call => call.path), ["/welcome"]);
  });
});

test("failed ensure rejects without a second welcome", async () => {
  await withReplies([missing, { status: 503, body: { detail: "Ensure unavailable" } }], async calls => {
    await assert.rejects(backend.submitWelcomeProfile(payload), error => error instanceof ApiError && error.status === 503);
    assert.deepEqual(calls.map(call => call.path), ["/welcome", "/profile"]);
  });
});

test("missing profile on retry rejects after exactly three backend calls", async () => {
  await withReplies([missing, { status: 200, body: { id: 7 } }, missing], async calls => {
    await assert.rejects(backend.submitWelcomeProfile(payload), error => error instanceof ApiError && error.detail === "User not found");
    assert.deepEqual(calls.map(call => call.path), ["/welcome", "/profile", "/welcome"]);
  });
});

for (const [name, reply] of [
  ["other 403 detail", { status: 403, body: { detail: "Access denied" } }],
  ["different status with missing-profile detail", { status: 500, body: { detail: "User not found" } }],
  ["network failure", new TypeError("Connection lost")],
  ["timeout", new DOMException("Timed out", "TimeoutError")],
] as [string, Reply][]) test(`${name} never ensures or retries`, async () => {
  await withReplies([reply], async calls => {
    await assert.rejects(backend.submitWelcomeProfile(payload));
    assert.deepEqual(calls.map(call => call.path), ["/welcome"]);
  });
});

test("successful welcome does not ensure or retry", async () => {
  await withReplies([success], async calls => {
    assert.deepEqual(await backend.submitWelcomeProfile(payload), success.body);
    assert.deepEqual(calls.map(call => call.path), ["/welcome"]);
  });
});
