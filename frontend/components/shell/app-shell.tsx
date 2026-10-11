import Link from "next/link";
import { Brand } from "~/components/brand";
import { AccountMenu } from "~/components/shell/account-menu";
import { TabBar, TopNavLinks } from "~/components/shell/nav-links";

// DESIGN.md › App shell: 64px top bar, content, disclaimer footer; tab bar on phones.
export function AppShell({
  username,
  children,
}: {
  username: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b border-line bg-surface">
        <div className="mx-auto flex h-16 w-full max-w-page-max items-center gap-6 px-gutter-mobile md:px-gutter-desktop">
          <Brand href="/dashboard" />
          <TopNavLinks />
          <div className="ml-auto">
            <AccountMenu username={username} />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-page-max flex-1 px-gutter-mobile pt-8 pb-28 md:px-gutter-desktop md:pb-12">
        {children}
      </main>

      <DisclaimerFooter />
      <TabBar />
    </div>
  );
}

export function DisclaimerFooter() {
  return (
    <footer className="border-t border-line bg-background pb-20 md:pb-0">
      <div className="mx-auto flex w-full max-w-page-max flex-col gap-3 px-gutter-mobile py-6 font-body text-body-sm text-ink-muted md:flex-row md:items-center md:justify-between md:px-gutter-desktop">
        <p className="max-w-reading-max">
          Food4U suggests food, not treatment. Check diet changes with your care team,
          especially during a flare.
        </p>
        <nav aria-label="Legal" className="flex flex-wrap gap-x-4 gap-y-1">
          <Link href="/privacy" className="underline-offset-4 hover:underline">
            Privacy
          </Link>
          <Link href="/privacy#health-data" className="underline-offset-4 hover:underline">
            How we use your health data
          </Link>
          <a href="mailto:support@food4u.app" className="underline-offset-4 hover:underline">
            Support
          </a>
        </nav>
      </div>
    </footer>
  );
}
