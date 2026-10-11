"use server";

// Login / register server action (was the action in app/routes/_auth.login.tsx).
import { env } from "cloudflare:workers";
import { redirect } from "next/navigation";
import { z } from "zod";
import UserService from "~/api/services/userService";
import { ApiService } from "~/api/services/baseService";
import { commitSession, getSession } from "~/lib/session";

const credentials = z.object({
  username: z.string().email("Enter a valid email address.").trim(),
  password: z.string().min(6, "Use at least 6 characters.").trim(),
  actionType: z.enum(["login", "register"]),
});

export type AuthState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "registered"; message: string };

export async function authenticate(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = credentials.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
    actionType: formData.get("actionType"),
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Check the form." };
  }
  const { username, password, actionType } = parsed.data;
  const userService = new UserService(env);

  if (actionType === "register") {
    const result = await userService.registerUser({ username, password });
    if (!result.success) {
      return { status: "error", message: result.message };
    }
    const session = await getSession();
    session.data.welcome = { isComplete: false };
    await commitSession(session);
    return { status: "registered", message: "Account created. Log in to continue." };
  }

  const result = await userService.loginUser({ username, password }, env);
  if (!result.success || !result.user) {
    ApiService.clearToken();
    return { status: "error", message: result.message || "Invalid email or password." };
  }

  const session = await getSession();
  session.data.auth = result.user;
  session.data.token = result.token;
  await commitSession(session);
  redirect("/dashboard");
}
