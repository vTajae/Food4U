// POST /api/auth/logout: ends the KV session and sends the user to /login.
import { redirect } from "next/navigation";
import { destroySession } from "~/lib/session";

export async function POST() {
  await destroySession();
  redirect("/login");
}
