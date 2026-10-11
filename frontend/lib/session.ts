// KV-backed session, replacing Remix's createWorkersKVSessionStorage.
// Cookie "__session" holds "<id>.<hmac>"; the data lives in KV under session:<id>.
import { env } from "cloudflare:workers";
import { cookies } from "next/headers";
import type { LoginCookieData } from "~/api/schemas/user";

export type SessionData = {
  auth?: LoginCookieData;
  welcome?: { isComplete: boolean };
  /** JWT for the FastAPI backend, minted at login / refresh. */
  token?: string;
  flash?: { error?: string };
};

const COOKIE = "__session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days, as before
const encoder = new TextEncoder();

function toBase64Url(bytes: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function sign(id: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(env.USER_SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return toBase64Url(await crypto.subtle.sign("HMAC", key, encoder.encode(id)));
}

async function readCookie(): Promise<string | null> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const dot = raw.lastIndexOf(".");
  if (dot <= 0) return null;
  const id = raw.slice(0, dot);
  const sig = raw.slice(dot + 1);
  return (await sign(id)) === sig ? id : null;
}

const kvKey = (id: string) => `session:${id}`;

/** Reads the current session. Safe in layouts, pages, actions and route handlers. */
export async function getSession(): Promise<{ id: string | null; data: SessionData }> {
  const id = await readCookie();
  if (!id) return { id: null, data: {} };
  const data = await env.cloudflare_KV.get<SessionData>(kvKey(id), "json");
  return { id, data: data ?? {} };
}

/**
 * Persists session data. Sets the cookie when the session is new, which is only
 * allowed in Server Actions and Route Handlers; pages that merely update an
 * existing session only touch KV.
 */
export async function commitSession(
  session: { id: string | null; data: SessionData }
): Promise<void> {
  let id = session.id;
  const isNew = !id;
  if (!id) id = crypto.randomUUID();

  await env.cloudflare_KV.put(kvKey(id), JSON.stringify(session.data), {
    expirationTtl: MAX_AGE,
  });

  if (isNew) {
    (await cookies()).set(COOKIE, `${id}.${await sign(id)}`, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: MAX_AGE,
    });
  }
  session.id = id;
}

/** Deletes the KV record and clears the cookie (Server Action / Route Handler only). */
export async function destroySession(): Promise<void> {
  const id = await readCookie();
  if (id) await env.cloudflare_KV.delete(kvKey(id));
  (await cookies()).delete(COOKIE);
}
