import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthTabs } from "~/components/login/auth-tabs";
import { getSession } from "~/lib/session";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage() {
  // Signed-in users never see the auth screen (was functions/_middleware.ts intent).
  const session = await getSession();
  if (session.data.auth) redirect("/dashboard");

  return <AuthTabs />;
}
