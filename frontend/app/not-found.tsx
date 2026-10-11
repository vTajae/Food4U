import Link from "next/link";
import { buttonVariants } from "~/components/ui/button-variants";

// Replaces the splat route app/routes/_auth.$.tsx, now styled with the design tokens.
export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-reading-max flex-col items-start justify-center gap-4 px-gutter-mobile py-12 font-body text-ink">
      <p className="font-data text-data-caps uppercase text-ink-muted">404</p>
      <h1 className="font-display text-display-md">We couldn&apos;t find that page.</h1>
      <p className="text-body-md text-ink-muted">
        The link may be old, or the page may have moved.
      </p>
      <Link href="/dashboard" className={buttonVariants()}>
        Go to your dashboard
      </Link>
    </main>
  );
}
