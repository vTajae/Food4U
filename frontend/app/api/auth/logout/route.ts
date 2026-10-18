// POST /api/auth/logout: ends the KV session and sends the user to /login.
import { destroySession } from "~/lib/session";

export async function POST() {
  await destroySession();
  return new Response(null, { status: 303, headers: { Location: "/login" } });
}
