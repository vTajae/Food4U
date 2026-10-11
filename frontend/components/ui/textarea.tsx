"use client";

// Token-styled textarea (the dashboard ask box builds on it).
import * as React from "react";

import { cn } from "~/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      data-slot="textarea"
      className={cn(
        "w-full min-w-0 resize-none rounded-md border border-line-strong bg-surface px-3.5 py-3 font-body text-body-md text-ink outline-none placeholder:text-ink-muted disabled:cursor-not-allowed disabled:opacity-40",
        "focus-visible:border-2 focus-visible:border-primary focus-visible:px-[13px] focus-visible:py-[11px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
        "aria-invalid:border-2 aria-invalid:border-avoid aria-invalid:px-[13px] aria-invalid:py-[11px]",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export { Textarea };
