// SearchBarWithButtons.tsx
// Multi-select combobox (shadcn Command + Popover) over /api/refs suggestions.
import React, { useEffect, useId, useRef, useState } from "react";
import debounce from "lodash.debounce";
import { useFetcher } from "@remix-run/react";
import { DebouncedFunc } from "lodash";
import { Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import { Suggestion } from "../../../api/schemas/refs";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { cn } from "~/lib/utils";

interface SearchBarWithButtonsProps {
  onSuggestionSelect: (selectedSuggestions: Suggestion[]) => void;
  queryKey: string;
  placeholderText?: string;
  selectedSuggestions: Suggestion[];
  labelledBy?: string; // id of the visible question that names this field
}

export type RefBarFetchType = {
  suggestions: Suggestion[];
  message?: string;
  errors?: Record<string, string[]>;
};

const suggestionKey = (s: Suggestion) => `${s.name}-${s.code || ""}`;

export const SearchBarWithButtons: React.FC<SearchBarWithButtonsProps> = ({
  onSuggestionSelect,
  queryKey,
  placeholderText = "Search...",
  selectedSuggestions,
  labelledBy,
}) => {
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const fetcher = useFetcher<RefBarFetchType>();
  const listId = useId();

  // Use a ref to store the debounced function with correct typing
  const fetchSuggestionsRef = useRef<DebouncedFunc<(query: string) => void>>();

  // Initialize the debounced function
  useEffect(() => {
    fetchSuggestionsRef.current = debounce((query: string) => {
      if (!query) {
        setSuggestions([]);
        return;
      }
      fetcher.load(
        `/api/refs?query=${encodeURIComponent(query)}&type=${encodeURIComponent(
          queryKey
        )}`
      );
    }, 300);

    // Cleanup function to cancel debounced calls on unmount or queryKey change
    return () => {
      fetchSuggestionsRef.current?.cancel();
    };
  }, [queryKey, fetcher]);

  // Effect to call the debounced function whenever inputValue changes
  useEffect(() => {
    const inputvalue = inputValue.trim();
    fetchSuggestionsRef.current?.(inputvalue);
  }, [inputValue]);

  // Effect to handle fetcher data updates; server messages surface as a toast.
  useEffect(() => {
    if (fetcher.data && fetcher.data.suggestions) {
      setSuggestions(fetcher.data.suggestions);
    } else if (fetcher.data && fetcher.data.message) {
      setSuggestions([]);
      toast.error(fetcher.data.message, { id: `refs-${queryKey}` });
    }
  }, [fetcher.data, queryKey]);

  const isSelected = (suggestion: Suggestion) =>
    selectedSuggestions.some(
      (s) => s.name === suggestion.name && s.code === suggestion.code
    );

  const handleToggle = (suggestion: Suggestion) => {
    const updatedSelected = isSelected(suggestion)
      ? selectedSuggestions.filter(
          (s) => !(s.name === suggestion.name && s.code === suggestion.code)
        )
      : [...selectedSuggestions, suggestion];

    // Notify parent component
    onSuggestionSelect(updatedSelected);
  };

  const isLoading = fetcher.state === "loading";
  const hasQuery = inputValue.trim().length > 0;

  return (
    <div className="w-full max-w-reading-max">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="secondary"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-labelledby={labelledBy}
            className="w-full justify-between px-3.5 text-body-md font-normal text-ink"
          >
            <span className={cn(selectedSuggestions.length === 0 && "text-ink-muted")}>
              {selectedSuggestions.length > 0
                ? `${selectedSuggestions.length} selected`
                : placeholderText}
            </span>
            <ChevronsUpDown aria-hidden="true" className="text-ink-muted" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-(--radix-popover-trigger-width) min-w-72 p-0"
        >
          {/* Server-side search, so cmdk's own filtering is off. */}
          <Command shouldFilter={false}>
            <CommandInput
              value={inputValue}
              onValueChange={setInputValue}
              placeholder={placeholderText}
              aria-label={placeholderText}
            />
            <CommandList id={listId} aria-busy={isLoading}>
              {isLoading && (
                <div role="status" className="px-3 py-4 text-body-sm text-ink-muted">
                  Loading...
                </div>
              )}
              {!isLoading && hasQuery && (
                <CommandEmpty>No matches. Try a different word.</CommandEmpty>
              )}
              {suggestions.length > 0 && (
                <CommandGroup>
                  {suggestions.map((suggestion) => {
                    const selected = isSelected(suggestion);
                    return (
                      <CommandItem
                        key={suggestionKey(suggestion)}
                        value={suggestionKey(suggestion)}
                        onSelect={() => handleToggle(suggestion)}
                        data-checked={selected}
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            "flex size-5 shrink-0 items-center justify-center rounded-(--rounded-sm) border border-line-strong",
                            selected && "border-primary bg-primary text-on-primary"
                          )}
                        >
                          {selected && <Check className="size-4 text-on-primary" />}
                        </span>
                        <span>
                          {suggestion.name}{" "}
                          {suggestion.code ? `: ${suggestion.code}` : ""}
                          {/* cmdk owns aria-selected (the highlighted row), so announce the checked state as text. */}
                          {selected && <span className="sr-only"> (selected)</span>}
                        </span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
