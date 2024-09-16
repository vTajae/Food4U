import { redirect, Session } from "@remix-run/cloudflare";
import { checkAuthentication } from "../context/session/checkAuthentication";

// Define the structure of the environment variables
interface EnvWithKV {
  USER_SESSION_SECRET: string;
  USER_COOKIE_SECRET: string;
  ASSETS: object;
  theform: KVNamespace;
  __STATIC_CONTENT: KVNamespace;
  DB: D1Database;
}

// Extend the overall context model including the request, session, and environment variables
interface RequestContext {
  request: Request;
  env: EnvWithKV;
  session: Session;
  next: (request: Request) => Promise<Response>;
}

export async function onRequest(context: RequestContext) {
  const { request, session, next } = context;

  // Check if the user is authenticated using the session
  const isAuthenticated = await checkAuthentication({ session });
  // Redirect unauthenticated users trying to access the protected dashboard directly
  if (!isAuthenticated) {
    return redirect("/login");
  }
  // Allow the request to proceed if it doesn't match the conditions above
  return next(request);
}
