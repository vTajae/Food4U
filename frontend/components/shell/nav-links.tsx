"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircleQuestion, UserRound } from "lucide-react";
import { cn } from "~/lib/utils";

// Only destinations that exist today. Meal plan / Groceries arrive with Phase 3.
export const destinations = [
  { href: "/dashboard", label: "Ask", icon: MessageCircleQuestion },
  { href: "/welcome", label: "Profile", icon: UserRound },
] as const;

export function useIsActive() {
  const pathname = usePathname();
  return (href: string) => pathname === href || pathname.startsWith(`${href}/`);
}

// Desktop top-bar links.
export function TopNavLinks() {
  const isActive = useIsActive();
  return (
    <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
      {destinations.map(({ href, label }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex min-h-11 items-center rounded-md px-4 font-body text-label-md no-underline transition-colors",
              active ? "bg-primary-soft text-primary" : "text-ink-muted hover:text-ink"
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

// Mobile bottom tab bar.
export function TabBar() {
  const isActive = useIsActive();
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="grid h-16 grid-cols-2">
        {destinations.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-full flex-col items-center justify-center gap-1 font-body text-label-sm no-underline",
                  active ? "text-primary" : "text-ink-muted"
                )}
              >
                <Icon aria-hidden="true" className="size-6" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
