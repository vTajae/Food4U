"use client";

import React from "react";
import { buttonVariants } from "~/components/ui/button-variants";

export default function ErrorFallback({ reset }: { reset: () => void }): React.JSX.Element {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-reading-max flex-col items-start justify-center gap-4 px-gutter-mobile py-12 font-body text-ink">
      <p className="font-display text-title-md text-primary">Food4U</p>
      <h1 className="font-display text-display-md">Something went wrong</h1>
      <p className="text-body-md text-ink-muted">
        We couldn&apos;t load this page. Try again, or go home to continue.
      </p>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={reset} className={buttonVariants()}>
          Try again
        </button>
        {/* A full navigation remains usable even if the client router failed. */}
        <a href="/" className={buttonVariants({ variant: "secondary" })}>
          Go home
        </a>
      </div>
    </main>
  );
}
