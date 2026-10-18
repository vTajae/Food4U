import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FormProvider } from "~/components/form/context";
import { OnboardingStepper } from "~/components/onboarding/stepper";
import { requireSession } from "~/lib/auth";

export const metadata: Metadata = { title: "Your profile" };

export default async function WelcomePage() {
  const session = await requireSession();
  // Already onboarded in this session: straight to the dashboard (as before).
  if (session.data.welcome?.isComplete === true) {
    redirect("/dashboard");
  }

  return (
    <FormProvider identity={session.data.auth!.publicId || session.id || undefined}>
      <OnboardingStepper />
    </FormProvider>
  );
}
