// SearchBarWithButtons.tsx
import React, { useEffect, useRef, useState } from "react";
import debounce from "lodash.debounce";
import { useFetcher } from "@remix-run/react";
import { DebouncedFunc } from "lodash";
import { Suggestion } from "../../../api/schemas/refs";

interface SearchBarWithButtonsProps {
  onSuggestionSelect: (selectedSuggestions: Suggestion[]) => void;
  queryKey: string;
  placeholderText?: string;
  selectedSuggestions: Suggestion[];
}

export type RefBarFetchType = {
  suggestions: Suggestion[];
  message?: string;
  errors?: Record<string, string[]>;
};

export const SearchBarWithButtons: React.FC<SearchBarWithButtonsProps> = ({
  onSuggestionSelect,
  queryKey,
  placeholderText = "Search...",
  selectedSuggestions,
}) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);
  const fetcher = useFetcher<RefBarFetchType>();

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

  // Effect to handle fetcher data updates
  useEffect(() => {
    if (fetcher.data && fetcher.data.suggestions) {
      setSuggestions(fetcher.data.suggestions);
      setMessage(null);
    } else if (fetcher.data && fetcher.data.message) {
      setSuggestions([]);
      setMessage(fetcher.data.message);
    }
  }, [fetcher.data]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleCheckboxChange = (suggestion: Suggestion) => {
    const isSelected = selectedSuggestions.some(
      (s) => s.name === suggestion.name && s.code === suggestion.code
    );
    const updatedSelected = isSelected
      ? selectedSuggestions.filter(
          (s) => !(s.name === suggestion.name && s.code === suggestion.code)
        )
      : [...selectedSuggestions, suggestion];

    // Notify parent component
    onSuggestionSelect(updatedSelected);
  };

  return (
    <div className="p-6 rounded-lg max-w-2xl mx-auto">
      <div className="flex items-center space-x-4">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholderText}
          className="w-full px-4 py-2 border border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
        {fetcher.state === "loading" && (
          <p className="text-gray-500">Loading...</p>
        )}
      </div>

      {message && <p className="text-red-500 mt-2">{message}</p>}

      {suggestions.length > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-4">
          {suggestions.map((suggestion) => (
            <label
              key={`${suggestion.name}-${suggestion.code || ""}`}
              className="flex items-center space-x-3"
            >
              <input
                type="checkbox"
                checked={selectedSuggestions.some(
                  (s) =>
                    s.name === suggestion.name && s.code === suggestion.code
                )}
                onChange={() => handleCheckboxChange(suggestion)}
                className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-gray-800">
                {suggestion.name}{" "}
                {suggestion.code ? `: ${suggestion.code}` : ""}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};
