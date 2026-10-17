import { redirect } from "next/navigation";
import { getSession } from "~/lib/session";

/**
 * For server components under (app): returns the session or redirects to /login.
 * Replaces checkAuthentication() + the per-loader redirect boilerplate.
 */
export async function requireSession() {
  const session = await getSession();
  if (!session.data.auth) {
    redirect("/login");
  }
  return session;
}
