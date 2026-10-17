import assert from "node:assert/strict";
import { test } from "node:test";
import { wakeBackend } from "../lib/wake-backend.ts";

test("auth-page wake drains its response body and stays one request per document", async () => {
  const original = globalThis.fetch;
  let calls = 0;
  let reads = 0;
  // No eager pulls: observing this stream proves the consumer actually drains it.
  const body = new ReadableStream<Uint8Array>({
    pull(controller) {
      reads++;
      controller.enqueue(new TextEncoder().encode('{"awake":false}'));
      controller.close();
    },
  }, { highWaterMark: 0 });
  const response = new Response(body);
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls++;
    assert.equal(input, "/api/wake");
    assert.equal(init?.cache, "no-store");
    assert.equal(init?.credentials, "omit");
    return response;
  }) as typeof fetch;
  try {
    const first = wakeBackend();
    assert.equal(wakeBackend(), first);
    await first;
    assert.equal(response.bodyUsed, true, "wake response body must be consumed");
    assert.equal(reads, 1, "wake response stream must be drained to completion");
    assert.deepEqual(await wakeBackend(), undefined);
    assert.equal(calls, 1);
  } finally { globalThis.fetch = original; }
});
