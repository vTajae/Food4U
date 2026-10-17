"use client";

// Searchable checkbox picker over browsable /api/refs lists and clinical search.
import React, { useEffect, useId, useState } from "react";
import { ChevronsUpDown, Search } from "lucide-react";
import { toast } from "sonner";
import { Suggestion } from "../../api/schemas/refs";
import { Button } from "~/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import { conditionsByCode, plainLabel } from "~/lib/refs/conditions";

interface SearchBarWithButtonsProps {
  onSuggestionSelect: (selectedSuggestions: Suggestion[]) => void;
  queryKey: string;
  placeholderText?: string;
  searchPlaceholder?: string;
  selectedSuggestions: Suggestion[];
  labelledBy?: string;
  describedBy?: string;
}

export type RefBarFetchType = {
  suggestions: Suggestion[];
  message?: string;
  errors?: Record<string, string[]>;
};

const suggestionKey = (s: Suggestion) => `${s.name}-${s.code || ""}`;
const labelFor = (s: Suggestion) => plainLabel(s.code, s.name);

async function loadSuggestions(queryKey: string, query: string, signal: AbortSignal) {
  const response = await fetch(
    `/api/refs?query=${encodeURIComponent(query)}&type=${encodeURIComponent(queryKey)}`,
    { signal },
  );
  const data = await response.json() as RefBarFetchType;
  if (!response.ok) throw new Error("Couldn't load options.");
  return data.suggestions ?? [];
}

export const SearchBarWithButtons: React.FC<SearchBarWithButtonsProps> = ({
  onSuggestionSelect,
  queryKey,
  placeholderText = "Select options",
  searchPlaceholder = "Search options",
  selectedSuggestions,
  labelledBy,
  describedBy,
}) => {
  const [open, setOpen] = useState(false);
  const [browseSuggestions, setBrowseSuggestions] = useState<Suggestion[]>([]);
  const [search, setSearch] = useState<{ query: string; items: Suggestion[] }>({ query: "", items: [] });
  const [inputValue, setInputValue] = useState("");
  const [browseLoading, setBrowseLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [browseError, setBrowseError] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const groupId = useId();
  const query = inputValue.trim();
  const isMedical = queryKey === "icd10cm" || queryKey === "conditions";
  const remoteSearch = isMedical && query.length > 0;

  // Browse immediately on open. Cuisines/diets then filter this complete list
  // locally, so typing never wakes the backend again for each keystroke.
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    let active = true;
    setBrowseLoading(true);
    setBrowseError(false);
    loadSuggestions(queryKey, "", controller.signal)
      .then(items => { if (active) setBrowseSuggestions(items); })
      .catch(() => {
        if (!active) return;
        setBrowseError(true);
        toast.error("Couldn't load options. Close and reopen the list to try again.", { id: `refs-${queryKey}` });
      })
      .finally(() => { if (active) setBrowseLoading(false); });
    return () => { active = false; controller.abort(); };
  }, [open, queryKey]);

  // Cancel both pending debounce and in-flight work on every edit/close. An old
  // response cannot replace the browse list after the user clears the search.
  useEffect(() => {
    if (!open || !remoteSearch) return;
    const controller = new AbortController();
    let active = true;
    setSearchLoading(true);
    setSearchError(false);
    const timer = setTimeout(() => {
      loadSuggestions(queryKey, query, controller.signal)
        .then(items => { if (active) setSearch({ query, items }); })
        .catch(() => {
          if (active) setSearchError(true);
        })
        .finally(() => { if (active) setSearchLoading(false); });
    }, 300);
    return () => { active = false; clearTimeout(timer); controller.abort(); };
  }, [open, queryKey, query, remoteSearch]);

  const isSelected = (suggestion: Suggestion) => selectedSuggestions.some(
    s => s.name === suggestion.name && s.code === suggestion.code,
  );
  const handleToggle = (suggestion: Suggestion) => {
    onSuggestionSelect(isSelected(suggestion)
      ? selectedSuggestions.filter(s => !(s.name === suggestion.name && s.code === suggestion.code))
      : [...selectedSuggestions, suggestion]);
  };

  const suggestions = remoteSearch
    ? (search.query === query ? search.items : [])
    : browseSuggestions.filter(s => labelFor(s).toLowerCase().includes(query.toLowerCase()));
  const isLoading = remoteSearch ? searchLoading : browseLoading;
  const failed = remoteSearch ? searchError : browseError;
  const heading = remoteSearch ? "Search results" : {
    cuisines: "Cuisines",
    diets: "Diets",
    icd10cm: "Common conditions",
    conditions: "Common food allergies and intolerances",
  }[queryKey] ?? "Options";
  const selectedNames = selectedSuggestions.map(labelFor).filter(Boolean);

  return (
    <div className="w-full min-w-0 max-w-reading-max">
      <Popover open={open} onOpenChange={value => { setOpen(value); if (value) setInputValue(""); }}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="secondary"
            role="combobox"
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-labelledby={labelledBy}
            aria-describedby={describedBy}
            className="w-full min-w-0 justify-between px-3.5 text-body-md font-normal text-ink"
          >
            <span className={cn("min-w-0 flex-1 truncate text-left", selectedNames.length === 0 && "text-ink-muted")}>
              {selectedNames.length > 0 ? selectedNames.slice(0, 2).join(", ") : placeholderText}
            </span>
            {selectedNames.length > 2 && <span className="shrink-0 text-body-sm">+{selectedNames.length - 2} more</span>}
            <ChevronsUpDown aria-hidden="true" className="shrink-0 text-ink-muted" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" aria-label={placeholderText} className="w-(--radix-popover-trigger-width) max-w-[calc(100vw-2rem)] p-0">
          <div className="flex h-12 items-center gap-2 border-b border-line px-3">
            <Search aria-hidden="true" className="size-5 shrink-0 text-ink-muted" />
            <input
              type="search"
              value={inputValue}
              onChange={event => setInputValue(event.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className="h-12 min-w-0 w-full bg-transparent text-body-md text-ink outline-hidden placeholder:text-ink-muted"
            />
          </div>
          {/* Native checkboxes expose answer state independently of focus. The
              Popover owns dialog ids/focus; Tab/Space retain native behavior. */}
          <div aria-busy={isLoading} className="max-h-[300px] overflow-x-hidden overflow-y-auto p-1">
              {isLoading && <div role="status" className="px-3 py-4 text-body-sm text-ink-muted">Loading options...</div>}
              {!isLoading && failed && <p role="alert" className="px-3 py-4 text-body-sm text-ink-muted">Couldn&apos;t load options. Close and reopen the list to try again.</p>}
              {!isLoading && !failed && suggestions.length === 0 && <p role="status" className="px-3 py-4 text-body-sm text-ink-muted">{query ? "No matches. Try a different word." : "No options available right now. Try again shortly."}</p>}
              {suggestions.length > 0 && (
                <fieldset className="min-w-0">
                  <legend className="px-2 py-1.5 font-data text-data-caps uppercase text-ink-muted">{heading}</legend>
                  {suggestions.map((suggestion, index) => {
                    const selected = isSelected(suggestion);
                    const learn = isMedical && !query && suggestion.code ? conditionsByCode[suggestion.code]?.learn : undefined;
                    const learnId = `${groupId}-learn-${index}`;
                    return (
                      <label key={suggestionKey(suggestion)} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-(--rounded-sm) px-2 py-2 text-body-md hover:bg-primary-soft focus-within:bg-primary-soft">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => handleToggle(suggestion)}
                          aria-label={labelFor(suggestion)}
                          aria-describedby={learn ? learnId : undefined}
                          className="size-5 shrink-0 cursor-pointer accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                        />
                        <span className="min-w-0 whitespace-normal">
                          <span className="block">{labelFor(suggestion)}</span>
                          {learn && <span id={learnId} className="mt-0.5 block text-body-sm text-ink-muted">{learn}</span>}
                        </span>
                      </label>
                    );
                  })}
                </fieldset>
              )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
