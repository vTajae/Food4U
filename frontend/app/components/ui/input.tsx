// shadcn/ui Input (new-york-v4), restyled with DESIGN.md tokens.
// 16px text so iOS Safari does not zoom on focus; forwardRef for react-hook-form on React 18.
import * as React from "react";

import { cn } from "~/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        data-slot="input"
        className={cn(
          "h-12 w-full min-w-0 rounded-(--rounded-md) border border-line-strong bg-surface px-3.5 font-body text-body-md text-ink transition-colors outline-none placeholder:text-ink-muted disabled:cursor-not-allowed disabled:opacity-40",
          "focus-visible:border-2 focus-visible:border-primary focus-visible:px-[13px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
          "aria-invalid:border-2 aria-invalid:border-avoid aria-invalid:px-[13px]",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
