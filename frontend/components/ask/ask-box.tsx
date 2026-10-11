"use client";

import { useId, useRef, useState } from "react";
import { ArrowUp, CircleAlert } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";

const MAX = 100;

// The main input on the Ask screen (DESIGN.md › Ask box).
// Enter submits, Shift+Enter adds a line, the field grows to four lines.
export function AskBox({
  onAsk,
  busy,
  placeholder = "Talk to me about food…",
}: {
  onAsk: (query: string) => void;
  busy: boolean;
  placeholder?: string;
}) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLTextAreaElement>(null);
  const errorId = useId();

  const submit = () => {
    const query = value.trim();
    if (!query) {
      setError("Type a question to get suggestions.");
      ref.current?.focus();
      return;
    }
    if (query.length > MAX) {
      setError(`Keep it under ${MAX} characters.`);
      return;
    }
    setError(null);
    onAsk(query);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="flex flex-col gap-2"
    >
      <div className="relative">
        <label htmlFor="ask" className="sr-only">
          Ask about food
        </label>
        <Textarea
          id="ask"
          ref={ref}
          value={value}
          rows={2}
          maxLength={MAX + 20}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError(null);
            // grow to ~4 lines
            const el = e.target;
            el.style.height = "auto";
            el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          className="min-h-14 rounded-lg pr-16 text-body-lg"
        />
        <Button
          type="submit"
          size="icon"
          aria-label="Ask"
          disabled={busy}
          aria-busy={busy}
          className="absolute right-2 bottom-2"
        >
          <ArrowUp aria-hidden="true" />
        </Button>
      </div>
      {error && (
        <p id={errorId} role="alert" className="flex items-center gap-1.5 text-body-sm text-avoid">
          <CircleAlert aria-hidden="true" className="size-4" />
          {error}
        </p>
      )}
    </form>
  );
}
