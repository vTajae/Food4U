export interface Env {
    cloudflare_KV: KVNamespace;
    USER_SESSION_SECRET: "testing123";
    USER_COOKIE_SECRET: "testing123";
    cloudflare_db: D1Database;
}
