


export interface Env {
	cloudflare_KV: KVNamespace;
	USER_SESSION_SECRET: "testing123";
	USER_COOKIE_SECRET: "testing123";
	JWT_SECRET_KEY: "happy";
	cloudflare_db: D1Database;
}
