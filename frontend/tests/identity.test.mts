// Regression tests for the identity boundary: the backend JWT carries the user's
// stable public id, never the D1 integer primary key (which differs per environment).
// Run: node --experimental-strip-types --test tests/
import assert from "node:assert/strict";
import { test } from "node:test";
import { decode } from "@tsndr/cloudflare-worker-jwt";
import Auth from "../lib/auth-service.ts";
import UserService from "../api/services/userService.ts";
import type UserRepository from "../api/repo/userRepository.ts";
import type { User } from "../api/schemas/user.ts";

const env = { JWT_SECRET_KEY: "test-secret", JWT_ACCESS_TOKEN_EXPIRE_MINUTES: "30m" } as unknown as Env;

async function fakeRepo(): Promise<UserRepository> {
  const user: User = {
    user_id: 1, // the same integer exists in every environment's D1
    public_id: "5f1c3a2e-0000-4000-8000-000000000001",
    username: "qa@food4u.test",
    user_password: await Auth.hashPassword("Loop-pass-1", 4),
    user_role: "2",
    createdAt: 1,
    updatedAt: 1,
  };
  return {
    findUserByUsername: async (u: string) => (u === user.username ? user : undefined),
    findUserById: async (id: number) => (id === 1 ? user : undefined),
    addBasicUser: async () => 2,
    addAdminUser: async () => 3,
  } as unknown as UserRepository;
}

test("loginUser mints a backend token whose user_id is the public id, not the D1 integer", async () => {
  const service = new UserService(env, await fakeRepo());
  const result = await service.loginUser({ username: "qa@food4u.test", password: "Loop-pass-1" }, env);
  assert.equal(result.success, true, result.message);
  assert.ok(result.token, "token returned for the session");
  const { payload } = decode(result.token!) as { payload: { user_id: unknown } };
  assert.equal(payload.user_id, "5f1c3a2e-0000-4000-8000-000000000001");
  assert.notEqual(payload.user_id, 1);
  assert.equal(result.user?.publicId, "5f1c3a2e-0000-4000-8000-000000000001");
});

test("refreshUser re-mints with the public id as well", async () => {
  const service = new UserService(env, await fakeRepo());
  const result = await service.refreshUser(env, 1);
  assert.equal(result.success, true, result.message);
  const { payload } = decode(result.token!) as { payload: { user_id: unknown } };
  assert.equal(payload.user_id, "5f1c3a2e-0000-4000-8000-000000000001");
});

test("loginUser does not call the backend (login depends on D1 only)", async () => {
  const calls: string[] = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    calls.push(String(input));
    return new Response("{}", { status: 500 });
  }) as typeof fetch;
  try {
    const service = new UserService(env, await fakeRepo());
    const result = await service.loginUser({ username: "qa@food4u.test", password: "Loop-pass-1" }, env);
    assert.equal(result.success, true, result.message);
    assert.deepEqual(calls, []);
  } finally {
    globalThis.fetch = realFetch;
  }
});
