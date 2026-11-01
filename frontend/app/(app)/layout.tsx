import { AppShell } from "~/components/shell/app-shell";
import { requireSession } from "~/lib/auth";

// Everything under (app) needs a valid session (was the _auth.* loader checks).
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  return <AppShell username={session.data.auth!.username} draftIdentity={session.data.auth!.publicId || session.id || undefined}>{children}</AppShell>;
}
