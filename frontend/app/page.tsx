import { redirect } from "next/navigation";
import { getSession } from "~/lib/session";

// "/" (was app/routes/_index.tsx): signed-in users go to the dashboard, others to login.
export default async function IndexPage() {
  const session = await getSession();
  redirect(session.data.auth ? "/dashboard" : "/login");
}
