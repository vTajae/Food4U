import assert from "node:assert/strict";
import { test } from "node:test";

const { ApiService } = await import("../api/services/baseService.ts");

test("all backend methods use the Worker API_BASE_URL binding", async () => {
  const original = globalThis.fetch;
  const requests: string[] = [];
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    requests.push(String(input));
    return Response.json([]);
  }) as typeof fetch;
  try {
    await ApiService.get("refs");
    await ApiService.post("welcome", { submission: [] });
    await ApiService.getSingle("user/profile");
    assert.deepEqual(requests, [
      "http://127.0.0.1:8765/refs",
      "http://127.0.0.1:8765/welcome",
      "http://127.0.0.1:8765/user/profile",
    ]);
  } finally {
    globalThis.fetch = original;
  }
});
