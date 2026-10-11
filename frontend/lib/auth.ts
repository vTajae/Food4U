import { redirect } from "next/navigation";
import { ApiService } from "~/api/services/baseService";
import { getSession, type SessionData } from "~/lib/session";

/**
 * For server components under (app): returns the session or redirects to /login.
 * Replaces checkAuthentication() + the per-loader redirect boilerplate.
 */
export async function requireSession() {
  const session = await getSession();
  if (!session.data.auth) {
    redirect("/login");
  }
  applyBackendToken(session.data);
  return session;
}

/**
 * Loads this request's backend JWT into ApiService right before use. ApiService
 * builds request headers synchronously, so set-then-call within one request is
 * safe even though the token field is static.
 */
export function applyBackendToken(data: SessionData) {
  if (data.token) ApiService.setToken(data.token);
  else ApiService.clearToken();
}
