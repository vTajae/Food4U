"use client";

import React from "react";
import "./globals.css";
import ErrorFallback from "~/components/ErrorFallback";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }): React.JSX.Element {
  // This boundary replaces the root layout, so it supplies its own document.
  return (
    <html lang="en">
      <body>
        <ErrorFallback reset={reset} />
      </body>
    </html>
  );
}
