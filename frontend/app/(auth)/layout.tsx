import { CircleCheck } from "lucide-react";
import { Brand } from "~/components/brand";

// Two-pane auth layout (takeaway T3): promise on the left, form on the right.
// On phones the left pane collapses to the brand and a one-line promise.
const checks = ["Your conditions", "Allergies and intolerances", "Diet and budget"];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <section className="flex flex-col justify-between gap-10 px-gutter-mobile py-8 lg:px-16 lg:py-14">
        <Brand size="lg" />

        <div className="flex max-w-reading-max flex-col gap-6">
          <h1 className="font-display text-display-md text-ink lg:text-display-lg">
            Know what you can eat tonight.
          </h1>
          <p className="hidden text-body-lg text-ink-muted lg:block">
            Ask in plain words. Every suggestion is checked against the things that
            matter for you, and you can see exactly what was checked.
          </p>
          <ul className="hidden flex-col gap-3 lg:flex" aria-label="What Food4U checks against">
            {checks.map((item) => (
              <li key={item} className="flex items-center gap-3 text-body-md text-ink">
                <CircleCheck aria-hidden="true" className="size-5 shrink-0 text-fits" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="hidden text-body-sm text-ink-muted lg:block">
          Food4U suggests food, not treatment.
        </p>
      </section>

      <section className="flex items-start justify-center bg-surface px-gutter-mobile py-8 lg:items-center lg:border-l lg:border-line lg:px-16">
        <div className="w-full max-w-md">{children}</div>
      </section>
    </div>
  );
}
