import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FetcherWithComponents } from "@remix-run/react";
import { useEffect, useState } from "react";
import debounce from "lodash.debounce";

// Interface for button properties
interface ButtonProps {
  fetcher: FetcherWithComponents<{ message?: string; errors?: Record<string, string[]> }>;
  text: string;
  route: string;
  action: string;
}

// Interface for SearchBar properties
interface SearchBarProps {
  fetcher: FetcherWithComponents<{ message?: string; errors?: Record<string, string[]>; suggestions?: { code: string; name: string }[] }>;
  placeholderText?: string;
}

// Validation schema for `query`, `code`, and `description`
export const inputSchema_Dash = z.object({
  query: z.string().min(1).max(100).optional(),
  code: z.string().min(1).max(10).optional(),
  description: z.string().min(1).max(200).optional(),
}).refine((data) => data.query || data.code || data.description, {
  message: "At least one field (query, code, or description) must be provided",
});

export function SearchBar({ fetcher, placeholderText = "Enter condition" }: SearchBarProps) {
  const [suggestions, setSuggestions] = useState<{ code: string; description: string }[] | null>(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<{ query?: string; code?: string; description?: string }>({
    resolver: zodResolver(inputSchema_Dash),
  });

  // Update suggestions from the fetcher response
  useEffect(() => {
    if (fetcher.data?.suggestions) {
      const flattenedSuggestions = fetcher.data.suggestions.flatMap((entry) =>
        entry instanceof Array
          ? entry.map((codeObj) => ({ code: codeObj.code, description: codeObj.name }))
          : { code: entry.code, description: entry.name }
      );
      setSuggestions(flattenedSuggestions);
    }
  }, [fetcher.data]);

  // Handle input change for autocomplete
  const handleInputChange = debounce((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    if (query) {
      const formData = new FormData();
      formData.append("query", query);
      formData.append("action", "autocomplete");

      fetcher.submit(formData, { method: "post", action: `/api/clinicals` });
    }
  }, 300);

  // Handle form submission (search)
  const onSubmit = (data: { query?: string; code?: string; description?: string }) => {
    const formData = new FormData();

    if (data.query) formData.append("query", data.query);
    if (data.code) formData.append("code", data.code);
    if (data.description) formData.append("description", data.description);

    formData.append("action", "search");

    fetcher.submit(formData, { method: "post", action: `/api/clinicals` });
  };

  // Handle suggestion click (submit code and description)
  const handleSuggestionClick = (suggestion: { code: string; description: string }) => {
    setValue("code", suggestion.code);
    setValue("description", suggestion.description);

    const formData = new FormData();
    formData.append("code", suggestion.code);
    formData.append("description", suggestion.description);
    formData.append("action", "consider");

    fetcher.submit(formData, { method: "post", action: `/api/clinicals` });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="search-form w-full max-w-md mx-auto">
      <div className="flex items-center space-x-2">
        <input
          type="text"
          {...register("query")}
          placeholder={placeholderText}
          className="search-input w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          onChange={handleInputChange}
        />
        <button type="submit" className="search-button bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 transition duration-200 ease-in-out">
          Search
        </button>
      </div>

      {/* Display validation errors */}
      {Object.keys(errors).length > 0 && <p className="error-message text-red-500 mt-2">{Object.values(errors).map((error) => error.message).join(', ')}</p>}

      {/* Display suggestions */}
      {suggestions && (
        <ul className="autocomplete-list border border-gray-300 mt-2 rounded-md shadow-md">
          {suggestions.map((suggestion) => (
            <li key={suggestion.code} className="p-2">
              <button
                type="button"
                className="w-full text-left hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {`${suggestion.code} - ${suggestion.description}`}
              </button>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}

export function ActionButton({ fetcher, text, route, action }: ButtonProps) {
  const handleClick = () => {
    const formData = new FormData();
    formData.append("query", text); // Pass the button text as a query parameter
    formData.append("action", action);
    fetcher.submit(formData, { method: "post", action: route });
  };

  return (
    <button onClick={handleClick} className="bg-red-500 text-white font-semibold rounded-lg py-3 px-5 m-2 transition-transform duration-300 hover:bg-red-600 hover:scale-105 shadow-lg shadow-red-300/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400">
      {text}
    </button>
  );
}
