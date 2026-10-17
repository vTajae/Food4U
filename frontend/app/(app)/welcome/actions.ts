"use server";

// Onboarding submission (was the action in app/routes/_auth.welcome.tsx).
import { redirect } from "next/navigation";
import ProfileService from "~/api/services/profileService";
import { welcomeFormDataSchema, type WelcomeFormData } from "~/api/schemas/welcome";
import { commitSession, getSession } from "~/lib/session";

export type WelcomeResult = { ok: true } | { ok: false; message: string };

export async function submitWelcome(payload: WelcomeFormData): Promise<WelcomeResult> {
  const session = await getSession();
  if (!session.data.auth) {
    redirect("/login");
  }
  const backend = new ProfileService(session.data.token);

  const parsed = welcomeFormDataSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, message: "Some answers look invalid. Please review them." };
  }

  try {
    await backend.submitWelcomeProfile(parsed.data);
  } catch (error) {
    console.error("Welcome submission failed:", error instanceof Error ? error.message : error);
    return { ok: false, message: "Couldn't save your profile. Please try again." };
  }

  session.data.welcome = { isComplete: true };
  await commitSession(session);
  redirect("/dashboard");
}
