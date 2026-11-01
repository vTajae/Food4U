// shadcn/ui Card (new-york-v4), restyled as a DESIGN.md "plate": white surface,
// 1px line border, 16px radius, no shadow (depth comes from tonal layers).
import * as React from "react";

import { cn } from "~/lib/utils";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "flex flex-col gap-4 rounded-(--rounded-lg) border border-line bg-surface py-5 font-body text-ink",
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("grid gap-1.5 px-5", className)}
      {...props}
    />
  );
}

// Meal and recipe names use the display face (DESIGN.md › Typography).
function CardTitle({
  className,
  children,
  ...props
}: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="card-title"
      className={cn("font-display text-title-md text-ink", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-body-md text-ink-muted", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-5", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex flex-wrap items-center gap-3 px-5", className)}
      {...props}
    />
  );
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
