// POST /api/auth/logout: ends the KV session and sends the user to /login.
import { redirect } from "next/navigation";
import { ApiService } from "~/api/services/baseService";
import { destroySession } from "~/lib/session";

export async function POST() {
  await destroySession();
  ApiService.clearToken();
  redirect("/login");
}
