// SearchBar.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { FetcherWithComponents } from "@remix-run/react";
import { Suggestion, SuggestionItem } from "../../../api/schemas/refs";
import debounce from "lodash.debounce";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { MedicalCode } from "../../../api/schemas/medical";
import { RefBarFetchType } from "./refSearchwButton";


interface SearchBarProps {
  fetcher: FetcherWithComponents<RefBarFetchType>;
  onSuggestionSelect: (selectedSuggestions: Suggestion[]) => void;
  placeholderText?: string;
  queryKey: string;
  initialSelectedSuggestions?: Suggestion[];
}

export function SearchBar({
  fetcher,
  onSuggestionSelect,
  placeholderText = "Enter condition",
  queryKey,
  initialSelectedSuggestions = [],
}: SearchBarProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Suggestion[]>(
    initialSelectedSuggestions
  );
  const [inputValue, setInputValue] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const searchSchema = z.object({
    query: z.string().nullable().optional(),
  });

  const {
    register,
    formState: { errors },
  } = useForm<{ query: string }>({
    resolver: zodResolver(searchSchema),
  });

  // Handle new data from the fetcher

  // CORRECT TYPE FOR
  useEffect(() => {
    if (fetcher.data?.autocomplete && fetcher.data.autocomplete[queryKey]) {
      const dataArray = fetcher.data.autocomplete[queryKey];
      const fetchedSuggestions: Suggestion[] = dataArray.map(
        (item: SuggestionItem | MedicalCode) => {
          if (typeof item === "string") {
            return { name: item };
          } else {
            // Assuming item is of type MedicalCode
            return { name: `${item.code}: ${item.name}`, code: item.code };
          }
        }
      );

      setSuggestions(fetchedSuggestions);
      setMessage(null);
      setLoading(false);
    } else if (fetcher.data?.message) {
      setSuggestions([]);
      setMessage(fetcher.data.message);
      setLoading(false);
    }
  }, [fetcher.data, queryKey]);

  // Debounced input change handler
  const handleInputChange = debounce(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      setInputValue(query);

      if (query) {
        setLoading(true);
        setMessage(null);
        fetcher.load(`/api/refs?query=${query}&action=${queryKey}`);
      } else {
        setSuggestions([]);
      }
    },
    300
  );

  // Handle checkbox change
  const handleCheckboxChange = (suggestion: Suggestion, checked: boolean) => {
    let updatedSelectedSuggestions = [...selectedSuggestions];
    if (checked) {
      if (!updatedSelectedSuggestions.find((s) => s.name === suggestion.name)) {
        updatedSelectedSuggestions.push(suggestion);
      }
    } else {
      updatedSelectedSuggestions = updatedSelectedSuggestions.filter(
        (s) => s.name !== suggestion.name
      );
    }
    setSelectedSuggestions(updatedSelectedSuggestions);
    onSuggestionSelect(updatedSelectedSuggestions);
  };

  const isSuggestionSelected = (suggestion: Suggestion) => {
    return selectedSuggestions.some((s) => s.name === suggestion.name);
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        {...register("query")}
        value={inputValue}
        onChange={(e) => {
          handleInputChange(e);
          setInputValue(e.target.value);
        }}
        placeholder={placeholderText}
        className="search-input"
      />
      {errors.query && (
        <p className="error-message text-red-500 mt-2">
          {errors.query.message}
        </p>
      )}
      {loading && <p className="loader mt-2 text-gray-500">Loading...</p>}
      {message && <p className="message text-yellow-500 mt-2">{message}</p>}
      {suggestions.length > 0 && (
        <ul className="autocomplete-list">
          {suggestions.map((suggestion) => (
            <li key={suggestion.name}>
              <label>
                <input
                  type="checkbox"
                  checked={isSuggestionSelected(suggestion)}
                  onChange={(e) =>
                    handleCheckboxChange(suggestion, e.target.checked)
                  }
                />
                {suggestion.name}
              </label>
            </li>
          ))}
        </ul>
      )}
      {selectedSuggestions.length > 0 && (
        <div className="selected-suggestions">
          <h4>Selected:</h4>
          <ul>
            {selectedSuggestions.map((suggestion) => (
              <li key={suggestion.name}>
                {suggestion.name}
                <button onClick={() => handleCheckboxChange(suggestion, false)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
