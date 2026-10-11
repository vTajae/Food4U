import type { Metadata } from "next";
import { env } from "cloudflare:workers";
import { redirect } from "next/navigation";
import ProfileService from "~/api/services/profileService";
import UserService from "~/api/services/userService";
import { ApiError } from "~/api/services/baseService";
import type { ProfileSchema } from "~/api/schemas/profile";
import { AskScreen } from "~/components/ask/ask-screen";
import { BackendUnavailable } from "~/components/shell/backend-unavailable";
import { applyBackendToken, requireSession } from "~/lib/auth";
import { commitSession, type SessionData } from "~/lib/session";

export const metadata: Metadata = { title: "Ask" };

// Chips shown under the ask box: diets plus condition/allergy attributes.
function profileChips(profile: ProfileSchema): string[] {
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

type Loaded =
  | { kind: "profile"; profile: ProfileSchema }
  | { kind: "unavailable"; detail?: string };

/**
 * Loads the backend profile for this identity. Each backend answer means
 * something specific and is handled explicitly:
 * - 403 "Token has expired"  -> mint a new token (we own identity) and retry once
 * - 403 "User not found"     -> the profile row doesn't exist yet: create it, retry once
 * - other 4xx/5xx or network -> show the unavailable state (never "no profile")
 */
async function loadProfile(session: { id: string | null; data: SessionData }): Promise<Loaded> {
  let refreshed = false;
  let ensured = false;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return { kind: "profile", profile: await ProfileService.getAllData() };
    } catch (error) {
      if (!(error instanceof ApiError)) {
        console.error("Profile request failed:", error);
        return { kind: "unavailable" };
      }
      if (error.status === 403 && error.detail === "Token has expired" && !refreshed) {
        refreshed = true;
        const refresh = await new UserService(env).refreshUser(env, session.data.auth!.id);
        if (!refresh.success || !refresh.token) redirect("/login");
        session.data.token = refresh.token;
        applyBackendToken(session.data);
        await commitSession(session);
        continue;
      }
      if (error.status === 403 && error.detail === "User not found" && !ensured) {
        ensured = true;
        try {
          await ProfileService.ensureProfile();
        } catch (ensureError) {
          console.error("Could not create the backend profile:", ensureError);
          return { kind: "unavailable", detail: `HTTP ${(ensureError as ApiError).status ?? "?"}` };
        }
        continue;
      }
      console.error("Profile request failed:", error.message);
      return { kind: "unavailable", detail: `HTTP ${error.status}` };
    }
  }
  return { kind: "unavailable" };
}

export default async function DashboardPage() {
  const session = await requireSession();

  if (session.data.welcome?.isComplete === false) {
    redirect("/welcome");
  }

  const loaded = await loadProfile(session);
  if (loaded.kind === "unavailable") {
    return <BackendUnavailable detail={loaded.detail} />;
  }

  // A profile with no answers yet means onboarding hasn't been done.
  const { profile } = loaded;
  const hasAnswers = (profile.attributes?.length ?? 0) > 0 || (profile.diets?.length ?? 0) > 0;
  if (!hasAnswers && session.data.welcome?.isComplete !== true) {
    session.data.welcome = { isComplete: false };
    await commitSession(session);
    redirect("/welcome");
  }

  if (session.data.welcome) {
    delete session.data.welcome;
    await commitSession(session);
  }

  return <AskScreen profileChips={profileChips(profile)} />;
}
