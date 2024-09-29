// Assuming EnvWithKV is an interface that includes your KV bindings and any other environment variables.
import { createWorkersKVSessionStorage, createCookie } from "@remix-run/cloudflare";
import { LoginCookieData } from "../../../api/schemas/user";
import {Env} from "../index"


type SessionData = {
  // Define the structure of your session data
    auth?: LoginCookieData;
};

type SessionFlashData = {
  error: string;
};

// Function to get the session secret, with default fallback
function getSessionSecret(env: Env) {
  // Access the environment variable directly

  const sessionSecret = env.USER_SESSION_SECRET;
  // if (!sessionSecret || sessionSecret === "default-secret") {
  //   console.warn("Session secret is not set or is set to the default. This is insecure in production.");
  // }
  return sessionSecret;
}


// You don't need to manually fetch the session secret from the environment variables;
// Cloudflare automatically makes them available via the `env` parameter in your functions.
// This function now simply ensures types are respected.

export function createSessionStorage(env: Env) {

  // Create a cookie to store session data
  const sessionCookie = createCookie("__session", {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
    sameSite: "lax",
    secrets: [getSessionSecret(env)], // Use the session secret from the environment variable or a default value
    secure: true,
  });

  const { getSession, commitSession, destroySession } = createWorkersKVSessionStorage<SessionData, SessionFlashData>({
    kv: env.cloudflare_KV, // Using the KV namespace from the environment
    cookie: sessionCookie
  });

  return { getSession, commitSession, destroySession };
}
