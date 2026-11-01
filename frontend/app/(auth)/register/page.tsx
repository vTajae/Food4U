import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthTabs } from "~/components/login/auth-tabs";
import { getSession } from "~/lib/session";

export const metadata: Metadata = { title: "Create account" };

export default async function RegisterPage() {
  const session = await getSession();
  if (session.data.auth) redirect("/dashboard");
  return <AuthTabs initialTab="register" />;
}
