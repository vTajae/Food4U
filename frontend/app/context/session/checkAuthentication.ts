import { Session } from "@remix-run/cloudflare";
import { LoginCookieData } from "../../../api/schemas/user";

interface RequestContext {
  session: Session;
}

export async function checkAuthentication({
  session,
}: RequestContext): Promise<LoginCookieData | false> {
  if (session) {
    const authData = session.get("auth");

    // Check if session contains auth data
    if (!authData) {
      return false; // No auth session data
    }

    return authData;
  }

  return false;

}
