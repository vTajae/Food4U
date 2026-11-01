// shadcn/ui Badge (new-york-v4), restyled as DESIGN.md chips.
// "constraint" = a user's condition/allergy/diet (aubergine wash); "neutral" = plain tag.
// Pills always mean tags, never buttons.
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "~/lib/utils";

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-1 rounded-full font-body text-label-sm whitespace-nowrap",
  {
    variants: {
      variant: {
        constraint: "min-h-9 bg-primary-soft px-3 text-primary",
        neutral: "min-h-7 border border-line bg-background px-2.5 text-ink",
      },
    },
    defaultVariants: {
      variant: "constraint",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
