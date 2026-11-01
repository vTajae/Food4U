"use client";

import React from "react";
import ErrorFallback from "~/components/ErrorFallback";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }): React.JSX.Element {
  // Error details stay out of the rendered page and client-side application logs.
  return <ErrorFallback reset={reset} />;
}
