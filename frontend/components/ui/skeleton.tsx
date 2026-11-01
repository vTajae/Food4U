// shadcn/ui Skeleton (new-york-v4): line-colored block with a gentle pulse,
// static under reduced motion (DESIGN.md › Feedback & states).
import * as React from "react";

import { cn } from "~/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-(--rounded-sm) bg-line motion-reduce:animate-none",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
