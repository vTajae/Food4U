import assert from "node:assert/strict";
import { test } from "node:test";
import { env } from "cloudflare:workers";

const { ApiService } = await import("../api/services/baseService.ts");
const api = new ApiService();

test("all backend methods use the Worker API_BASE_URL binding", async () => {
  const original = globalThis.fetch;
  const requests: string[] = [];
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    requests.push(String(input));
    return Response.json([]);
  }) as typeof fetch;
  try {
    await api.get("refs");
    await api.post("welcome", { submission: [] });
    await api.getSingle("user/profile");
    assert.deepEqual(requests, [
      "http://127.0.0.1:8765/refs",
      "http://127.0.0.1:8765/welcome",
      "http://127.0.0.1:8765/user/profile",
    ]);
  } finally {
    globalThis.fetch = original;
  }
});

test("invalid backend configuration rejects every method before fetch", async () => {
  const originalFetch = globalThis.fetch;
  const binding = env as { API_BASE_URL?: string };
  const originalUrl = binding.API_BASE_URL;
  let requests = 0;
  globalThis.fetch = (async () => {
    requests++;
    return Response.json([]);
  }) as typeof fetch;
  try {
    for (const value of [undefined, "", "not-a-url", "/relative", "ftp://example.test", "https:example.test"]) {
      if (value === undefined) delete binding.API_BASE_URL;
      else binding.API_BASE_URL = value;
      const message = !value
        ? "API_BASE_URL is not configured"
        : "API_BASE_URL is not an absolute http(s) URL";
      for (const call of [
        () => api.get("refs"),
        () => api.post("welcome", { submission: [] }),
        () => api.getSingle("user/profile"),
      ]) {
        await assert.rejects(call, { name: "Error", message });
      }
    }
    assert.equal(requests, 0);
  } finally {
    binding.API_BASE_URL = originalUrl;
    globalThis.fetch = originalFetch;
  }
});

test("backend binding is read per call and trailing slashes are removed", async () => {
  const originalFetch = globalThis.fetch;
  const originalUrl = env.API_BASE_URL;
  const requests: string[] = [];
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    requests.push(String(input));
    return Response.json([]);
  }) as typeof fetch;
  try {
    env.API_BASE_URL = "https://backend.example.test/api///";
    await api.get("refs?queryKey=diets");
    await api.post("welcome", { submission: [] });
    await api.getSingle("user/profile");
    env.API_BASE_URL = "http://other.example.test";
    await api.get("refs");
    assert.deepEqual(requests, [
      "https://backend.example.test/api/refs?queryKey=diets",
      "https://backend.example.test/api/welcome",
      "https://backend.example.test/api/user/profile",
      "http://other.example.test/refs",
    ]);
  } finally {
    env.API_BASE_URL = originalUrl;
    globalThis.fetch = originalFetch;
  }
});
