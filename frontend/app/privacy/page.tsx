import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "~/components/brand";

export const metadata: Metadata = { title: "Privacy" };

// Plain-language placeholder so the footer links resolve; legal text is pending.
export default function PrivacyPage() {
  return (
    <main className="mx-auto flex w-full max-w-reading-max flex-col gap-6 px-gutter-mobile py-10">
      <Brand />
      <h1 className="font-display text-display-md text-ink">Privacy</h1>
      <p className="text-body-md text-ink">
        Food4U stores your account, your answers to the profile questions and your
        session so it can check meals against them. We don&apos;t sell or share this
        information.
      </p>
      <h2 id="health-data" className="text-heading-sm text-ink">How we use your health data</h2>
      <p className="text-body-md text-ink">
        Conditions, allergies and diets you enter are used only to filter and explain
        suggestions. You can change or remove them from your profile at any time.
      </p>
      <p className="text-body-sm text-ink-muted">
        Full policy pending. Questions: <a href="mailto:support@food4u.app">support@food4u.app</a>.
      </p>
      <Link href="/dashboard" className="text-primary underline-offset-4 hover:underline">
        Back to the app
      </Link>
    </main>
  );
}
