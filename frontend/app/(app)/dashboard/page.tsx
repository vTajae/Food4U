import type { Metadata } from "next";
import { env } from "cloudflare:workers";
import { redirect } from "next/navigation";
import ProfileService from "~/api/services/profileService";
import UserService from "~/api/services/userService";
import { ApiService } from "~/api/services/baseService";
import type { ProfileSchema } from "~/api/schemas/profile";
import { AskScreen } from "~/components/ask/ask-screen";
import { applyBackendToken, requireSession } from "~/lib/auth";
import { commitSession } from "~/lib/session";

export const metadata: Metadata = { title: "Ask" };

// Chips shown under the ask box: diets plus condition/allergy attributes.
function profileChips(profile: ProfileSchema | null): string[] {
  if (!profile) return [];
  const chips: string[] = [];
  for (const d of profile.diets ?? []) {
    if (d.diet_type?.diet_name) chips.push(d.diet_type.diet_name);
  }
  for (const a of profile.attributes ?? []) {
    const category = (a.attribute_category || "").toLowerCase();
    if (/condition|allerg|restriction|icd/.test(category) && a.attribute_name) {
      chips.push(a.attribute_name);
    }
  }
  return Array.from(new Set(chips)).slice(0, 8);
}

// Port of the _auth.dashboard loader: load the profile, refresh the backend
// token once if it fails, and send new users to onboarding.
export default async function DashboardPage() {
  const session = await requireSession();

  if (session.data.welcome?.isComplete === false) {
    redirect("/welcome");
  }

  let profile = (await ProfileService.getAllData()) as ProfileSchema | void;

  if (!profile || !profile.id) {
    const userService = new UserService(env);
    const refresh = await userService.refreshUser(env, session.data.auth!.id);
    if (!refresh.success || !refresh.token) {
      ApiService.clearToken();
      redirect("/login");
    }
    session.data.token = refresh.token;
    applyBackendToken(session.data);
    profile = (await ProfileService.getAllData()) as ProfileSchema | void;

    if (!profile || !profile.id) {
      // Backend knows the login but has no profile yet: onboarding.
      session.data.welcome = { isComplete: false };
      await commitSession(session);
      redirect("/welcome");
    }
    await commitSession(session);
  }

  if (session.data.welcome) {
    delete session.data.welcome;
    await commitSession(session);
  }

  return <AskScreen profileChips={profileChips(profile ?? null)} />;
}
