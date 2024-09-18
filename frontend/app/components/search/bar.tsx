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
  placeholderText?: string;
}

// Define Zod schema for search validation
const searchSchema = z.object({
  query: z.string().nullable().optional(),  // Make query optional
  code: z.string().optional(),
  description: z.string().optional(),
});

// Utility function to create and submit FormData
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

// SearchBar component
export function SearchBar({
  fetcher,
  placeholderText = "Enter condition",
}: SearchBarProps) {
  const [suggestions, setSuggestions] = useState<
    { code: string; description: string }[] | null
  >(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ query: string }>({
    resolver: zodResolver(searchSchema),
  });

  // Update suggestions when fetcher receives data
  useEffect(() => {
    if (fetcher.data?.suggestions) {
      const flattenedSuggestions = fetcher.data.suggestions.map((entry) => ({
        code: entry.code,
        description: entry.name,
      }));
      setSuggestions(flattenedSuggestions);
    }
  }, [fetcher.data]);

  // Debounced input change handler
  const handleInputChange = debounce(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      if (query) {
        submitFormData(fetcher, { query, action: "autocomplete" }, "/api/clinicals");
      }
    },
    300
  );

  // Handle search form submit
  const onSubmit = (data: { query: string }) => {
    submitFormData(fetcher, { query: data.query, action: "search" }, "/api/clinicals");
  };

  // Handle suggestion click to submit `code` and `description`
  const handleSuggestionClick = debounce(
    (suggestion: { code: string; description: string }) => {
      submitFormData(
        fetcher,
        {
          description: suggestion.description,
          code: suggestion.code,
          action: "consider",
        },
        "/api/clinicals"
      );
          // Clear the suggestions after a selection is made to close the dropdown
    setSuggestions(null);
    },
    300
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="search-form w-full max-w-md mx-auto">
      <div className="flex items-center space-x-2">
        <input
          type="text"
          {...register("query")} // RHF still manages the 'query' field
          placeholder={placeholderText}
          className="search-input w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          onChange={handleInputChange}
        />
        <button
          type="submit"
          className="search-button bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 transition duration-200 ease-in-out"
        >
          Search
        </button>
      </div>

      {/* Display validation errors */}
      {errors.query && <p className="error-message text-red-500 mt-2">{errors.query.message}</p>}

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
