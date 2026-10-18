"use client";

import { LogOut, User } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { ThemeMenuItems } from "~/components/shell/theme-toggle";
import { browserDraftStorage, clearDraft } from "~/lib/onboarding-draft";

export function AccountMenu({ username, draftIdentity }: { username: string; draftIdentity?: string }) {
  // The initial letter as a quiet avatar; email addresses stay in the menu label.
  const initial = username.trim().charAt(0).toUpperCase() || "?";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="icon" aria-label="Account menu" className="rounded-full">
          <span aria-hidden="true" className="font-display text-title-md leading-none">
            {initial}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="normal-case tracking-normal font-body text-body-sm">
          <span className="flex items-center gap-2 text-ink">
            <User aria-hidden="true" className="size-4" />
            <span className="truncate">{username}</span>
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <ThemeMenuItems />
        <DropdownMenuSeparator />
        {/* A real form so sign-out works before hydration too. */}
        <form action="/api/auth/logout" method="post" onSubmit={() => clearDraft(browserDraftStorage(), draftIdentity)}>
          <DropdownMenuItem asChild destructive>
            <button type="submit" className="w-full">
              <LogOut aria-hidden="true" />
              Sign out
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
