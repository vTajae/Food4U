import Link from "next/link";
import { cn } from "~/lib/utils";

// The one brand mark: a pantry-label tag glyph plus the wordmark in the display face.
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 32"
      className={cn("size-8 shrink-0", className)}
      fill="none"
    >
      <path
        d="M4 11.5 13.2 4.9a3 3 0 0 1 3.5 0l9.9 7.1a3 3 0 0 1 1.2 2.4v9.6a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-12.5Z"
        fill="var(--color-primary)"
      />
      <circle cx="16" cy="12" r="2.2" fill="var(--color-on-primary)" />
      <path
        d="M9.5 19h13M9.5 22.5h8"
        stroke="var(--color-on-primary)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeDasharray="2.5 2.5"
      />
    </svg>
  );
}

export function Brand({
  href = "/",
  className,
  size = "md",
}: {
  href?: string;
  className?: string;
  size?: "md" | "lg";
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 rounded-md text-ink no-underline",
        className
      )}
    >
      <BrandMark className={size === "lg" ? "size-10" : "size-8"} />
      <span
        className={cn(
          "font-display leading-none",
          size === "lg" ? "text-display-md" : "text-title-md"
        )}
      >
        Food4U
      </span>
    </Link>
  );
}
