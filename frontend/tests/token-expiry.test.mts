// Regression test: Auth.generateToken must set `exp` about 30 minutes ahead, in seconds.
// Run: node --experimental-strip-types --test tests/
import assert from "node:assert/strict";
import { test } from "node:test";
import { decode } from "@tsndr/cloudflare-worker-jwt";
import Auth from "../lib/auth-service.ts";

test("generateToken({ expiresIn: '30m' }) expires ~30 minutes from now", async () => {
  const token = await Auth.generateToken({ user_id: "abc" }, "test-secret", { expiresIn: "30m" });
  const { payload } = decode(token) as { payload: { exp: number } };
  const now = Math.floor(Date.now() / 1000);
  const diff = payload.exp - now;
  assert.ok(diff > 29 * 60 && diff <= 31 * 60, `exp is ${diff}s from now (≈${(diff / 31557600).toFixed(1)} years); expected ≈1800s`);
});
