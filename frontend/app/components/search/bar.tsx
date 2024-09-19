import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FetcherWithComponents } from "@remix-run/react";
import { useEffect, useState } from "react";
import debounce from "lodash.debounce";

// Define TypeScript interfaces
interface ButtonProps {
  fetcher: FetcherWithComponents<{
    message?: string;
    errors?: Record<string, string[]>;
  }>;
  text: string;
  route: string;
  action: string;
}

interface SearchBarProps {
  fetcher: FetcherWithComponents<{
    message?: string;
    errors?: Record<string, string[]>;
    suggestions?: { code: string; name: string }[];
  }>;
  onSuggestionSelect: (suggestion: {
    code: string;
    description: string;
  }) => void;
  placeholderText?: string;
  queryKey: string; // Allow passing a custom query key like "conditions" or "icd10m"
}

const searchSchema = z.object({
  query: z.string().nullable().optional(),
});

const submitFormData = (
  fetcher: FetcherWithComponents<any>,
  formDataEntries: Record<string, string>,
  action: string,
  method: "post" | "get" = "post"
) => {
  const formData = new FormData();
  Object.entries(formDataEntries).forEach(([key, value]) => {
    formData.append(key, value);
  });
  fetcher.submit(formData, { method, action });
};

export function SearchBar({
  fetcher,
  onSuggestionSelect,
  placeholderText = "Enter condition",
  queryKey,
}: SearchBarProps) {
  const [suggestions, setSuggestions] = useState<
    { code: string; description: string }[] | null
  >(null);
  const [inputValue, setInputValue] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    formState: { errors },
  } = useForm<{ query: string }>({
    resolver: zodResolver(searchSchema),
  });

  useEffect(() => {
    if (fetcher.data?.suggestions) {
      const flattenedSuggestions = fetcher.data.suggestions.map(
        (entry: { code: string; name: string }) => ({
          code: entry.code,
          description: entry.name,
        })
      );
      setSuggestions(flattenedSuggestions);
      setLoading(false); // Stop loader after fetching suggestions
    }
  }, [fetcher.data]);

  const handleInputChange = debounce(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      if (query) {
        setLoading(true); // Start loader
        submitFormData(
          fetcher,
          { query, action: "autocomplete", key: queryKey },
          "/api/clinicals"
        );
      }
    },
    300
  );

  const handleSuggestionClick = (suggestion: {
    code: string;
    description: string;
  }) => {
    setInputValue(""); // Clear input
    setSuggestions(null); // Clear suggestions
    onSuggestionSelect(suggestion); // Pass suggestion to parent
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

      {loading && <p className="loader mt-2 text-white-500">Loading...</p>}

      {suggestions && (
        <ul className="autocomplete-list">
          {suggestions.map((suggestion) => (
            <li key={suggestion.code}>
              <button
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {`${suggestion.code} - ${suggestion.description}`}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ActionButton component
export function ActionButton({ fetcher, text, route, action }: ButtonProps) {
  const handleClick = () => {
    submitFormData(fetcher, { query: text, action }, route);
  };

  return (
    <button
      onClick={handleClick}
      className="
        bg-red-500 text-white 
        font-semibold rounded-lg 
        py-3 px-5 m-2 
        transition-transform duration-300 
        hover:bg-red-600 hover:scale-105 
        shadow-lg shadow-red-300/50 
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400"
    >
      {text}
    </button>
  );
}
