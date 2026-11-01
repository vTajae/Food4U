import { CircleAlert, CircleCheck, CircleX } from "lucide-react";
import { cn } from "~/lib/utils";

export type Verdict = "fits" | "care" | "avoid";

// Always icon + word + color (DESIGN.md › Verdict colors). Render only with real data.
const verdicts: Record<Verdict, { label: string; icon: typeof CircleCheck; className: string }> = {
  fits: { label: "Fits your plan", icon: CircleCheck, className: "bg-fits-tint text-fits" },
  care: { label: "Eat with care", icon: CircleAlert, className: "bg-care-tint text-care" },
  avoid: { label: "Avoid for now", icon: CircleX, className: "bg-avoid-tint text-avoid" },
};

export function VerdictBadge({ verdict, className }: { verdict: Verdict; className?: string }) {
  const { label, icon: Icon, className: colors } = verdicts[verdict];
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center gap-1.5 rounded-full px-2.5 font-body text-label-sm",
        colors,
        className
      )}
    >
      <Icon aria-hidden="true" className="size-4" />
      {label}
    </span>
  );
}
