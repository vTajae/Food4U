import Link from "next/link";
import { buttonVariants } from "~/components/ui/button-variants";
import { getSession } from "~/lib/session";

// Replaces the splat route app/routes/_auth.$.tsx, now styled with the design tokens.
export default async function NotFound() {
  const session = await getSession();
  const signedIn = Boolean(session.data.auth);
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-reading-max flex-col items-start justify-center gap-4 px-gutter-mobile py-12 font-body text-ink">
      <p className="font-data text-data-caps uppercase text-ink-muted">404</p>
      <h1 className="font-display text-display-md">We couldn&apos;t find that page.</h1>
      <p className="text-body-md text-ink-muted">
        The link may be old, or the page may have moved.
      </p>
      <Link href={signedIn ? "/dashboard" : "/login"} className={buttonVariants()}>
        {signedIn ? "Go to your dashboard" : "Go to login"}
      </Link>
    </main>
  );
}
