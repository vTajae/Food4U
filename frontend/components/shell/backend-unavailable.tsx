import { CloudOff } from "lucide-react";
import { buttonVariants } from "~/components/ui/button-variants";
import { BACKEND_WAKING_MESSAGE } from "~/lib/backend-status";

// Shown when the recommendation backend errors or can't be reached. Says what
// happened and what to do; never pretends the user has no profile.
export function BackendUnavailable({ detail, waking }: { detail?: string; waking?: boolean }) {
  return (
    <section
      role="alert"
      className="mx-auto flex w-full max-w-reading-max flex-col items-start gap-4 rounded-lg border border-care bg-care-tint p-6 text-ink"
    >
      <CloudOff aria-hidden="true" className="size-6 text-care" />
      <div className="flex flex-col gap-1">
        <h1 className="text-heading-sm">The food service isn&apos;t responding</h1>
        <p className="text-body-md text-ink-muted">
          {waking ? BACKEND_WAKING_MESSAGE : "Your account is fine. The suggestion service may be waking up; this usually takes under a minute."}
        </p>
        {detail && <p className="font-data text-data-md text-ink-muted">{detail}</p>}
      </div>
      <a href="/dashboard" className={buttonVariants({ variant: "secondary" })}>
        Try again
      </a>
    </section>
  );
}
