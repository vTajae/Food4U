// Generated by Wrangler on Mon Sep 16 2024 21:01:03 GMT-0400 (Eastern Daylight Time)
// by running `wrangler types`

interface Env {
	cloudflare_KV: KVNamespace;
	USER_SESSION_SECRET: "testing123";
	USER_COOKIE_SECRET: "testing123";
	JWT_SECRET_KEY: "happy";
	JWT_ACCESS_TOKEN_EXPIRE_MINUTES: "30m";
	cloudflare_db: D1Database;
}
