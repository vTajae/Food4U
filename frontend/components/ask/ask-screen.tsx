"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import type { SearchResultFood } from "~/api/schemas/suggestion";
import { AskBox } from "~/components/ask/ask-box";
import { RecommendationCard } from "~/components/results/recommendation-card";
import { EmptyResults, ResultsSkeleton } from "~/components/results/states";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";

type Suggestion = { label: string; action: string; queryKey: string; text: string };

// The former three red ActionButtons, as suggestion chips (takeaway T4/T7).
const suggestions: Suggestion[] = [
  { label: "Suggest a meal", action: "suggest", queryKey: "randomMeal", text: "I'm hungry" },
  { label: "Find a recipe", action: "recipie", queryKey: "newRecipie", text: "Let's cook something" },
  { label: "Which diets fit me?", action: "diet", queryKey: "dietSuggest", text: "What diets support my eating habits?" },
];

type Status = "idle" | "loading" | "done";

export function AskScreen({ profileChips }: { profileChips: string[] }) {
  const [status, setStatus] = useState<Status>("idle");
  const [results, setResults] = useState<SearchResultFood[]>([]);

  async function run(body: { action: string; queryKey: string; text: string }) {
    setStatus("loading");
    try {
      const fd = new FormData();
      fd.set("action", body.action);
      fd.set("queryKey", body.queryKey);
      fd.set("query", body.text);
      const res = await fetch("/api/suggestion", { method: "POST", body: fd });
      const data = (await res.json()) as { meal?: SearchResultFood[]; error?: string; message?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Couldn't get suggestions.", {
          description: "Check your connection and try again.",
        });
        setStatus(results.length ? "done" : "idle");
        return;
      }
      setResults(Array.isArray(data.meal) ? data.meal : []);
      setStatus("done");
    } catch (err) {
      console.error(err);
      toast.error("Couldn't reach the food database.", {
        description: "Check your connection and try again.",
      });
      setStatus(results.length ? "done" : "idle");
    }
  }

  return (
    <div className="flex flex-col gap-10">
      <section className="mx-auto flex w-full max-w-reading-max flex-col gap-5">
        <h1 className="font-display text-display-md text-ink md:text-display-lg">
          What should I eat?
        </h1>

        <AskBox
          busy={status === "loading"}
          onAsk={(query) => run({ action: "meal", queryKey: "general", text: query })}
        />

        <ul aria-label="Suggestions" className="-mx-gutter-mobile flex gap-2 overflow-x-auto px-gutter-mobile pb-1 md:mx-0 md:flex-wrap md:px-0">
          {suggestions.map((s) => (
            <li key={s.action} className="shrink-0">
              <button
                type="button"
                disabled={status === "loading"}
                onClick={() => run(s)}
                className={cn(
                  "inline-flex min-h-11 cursor-pointer items-center rounded-full border border-line bg-surface px-4 font-body text-label-sm text-ink transition-colors hover:border-line-strong hover:bg-primary-soft hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-40"
                )}
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>

        {profileChips.length > 0 && (
          <p className="flex flex-wrap items-center gap-2 text-body-sm text-ink-muted">
            <span>Your profile:</span>
            {profileChips.map((chip) => (
              <Badge key={chip}>{chip}</Badge>
            ))}
            <Link href="/welcome" className="text-primary underline-offset-4 hover:underline">
              Edit
            </Link>
          </p>
        )}
      </section>

      <section aria-live="polite" className="flex flex-col gap-4">
        {status === "loading" && <ResultsSkeleton />}
        {status === "idle" && <EmptyResults />}
        {status === "done" && results.length === 0 && (
          <div className="rounded-lg border border-line bg-surface px-6 py-10 text-center">
            <p className="text-heading-sm text-ink">No matches for that</p>
            <p className="mt-1 text-body-md text-ink-muted">Try different words, or one of the suggestions above.</p>
          </div>
        )}
        {status === "done" && results.length > 0 && (
          <>
            <h2 className="font-data text-data-caps uppercase text-ink-muted">
              {results.length} {results.length === 1 ? "suggestion" : "suggestions"}
            </h2>
            <ul className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {results.map((item, index) => (
                <li key={item.fdcId ?? index}>
                  <RecommendationCard item={item} index={index} />
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}
