// shadcn/ui Label (new-york-v4), restyled with DESIGN.md tokens.
import * as React from "react";
import { Label as LabelPrimitive } from "radix-ui";

import { cn } from "~/lib/utils";

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    data-slot="label"
    className={cn(
      "flex items-center gap-2 font-body text-label-sm text-ink select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-40",
      className
    )}
    {...props}
  />
));
Label.displayName = "Label";

export { Label };
