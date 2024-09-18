import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FetcherWithComponents } from "@remix-run/react";
import { useEffect, useState } from "react";
import debounce from "lodash.debounce";

interface ButtonProps {
  fetcher: FetcherWithComponents<{
    message?: string;
    errors?: Record<string, string[]>;
  }>; // Pass fetcher as a prop
  text: string; // The text displayed on the button
  route: string; // The route to which the button will post data
  action: string; // The action to be performed
}

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

// Validation schema for search query
const searchSchema = z.object({
  query: z
    .string()
    .min(1, "Search query is required")
    .max(100, "Search query is too long")
    .trim(),
});

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
    setValue, // Hook to manually set values in the form
    formState: { errors },
  } = useForm<{ query: string }>({
    resolver: zodResolver(searchSchema),
  });

  // Update suggestions when fetcher receives data
  useEffect(() => {
    if (fetcher.data?.suggestions) {
      // Flatten the array of suggestions to handle entries with multiple codes
      const flattenedSuggestions = fetcher.data.suggestions.flatMap((entry) =>
        entry instanceof Array
          ? entry.map((codeObj) => ({
              code: codeObj.code,
              description: codeObj.name,
            }))
          : { code: entry.code, description: entry.name }
      );
      setSuggestions(flattenedSuggestions);
    }
  }, [fetcher.data]);

  // Handle input changes for the search bar
  const handleInputChange = debounce(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      if (query) {
        const formData = new FormData();
        formData.append("query", query);
        formData.append("action", "autocomplete");

        fetcher.submit(formData, {
          method: "post",
          action: `/api/clinicals`,
        });
      }
    },
    300
  );

  // Handle search form submit
  const onSubmit = (data: { query: string }) => {
    const formData = new FormData();
    formData.append("query", data.query); // Submit the search query
    formData.append("action", "search");

    fetcher.submit(formData, {
      method: "post",
      action: `/api/clinicals`,
    });
  };

  // Handle suggestion click to submit `code` and `description`
  const handleSuggestionClick = debounce(
    (suggestion: { code: string; description: string }) => {
      const formData = new FormData();
      formData.append("query", suggestion.code); // Keep query key for Zod validation
      formData.append("description", suggestion.description); // Send description
      formData.append("icd10cm", suggestion.code); // Send ICD-10 code
      formData.append("action", "consider"); // Set action to "consider"

      console.log("Submitting form data: ", {
        query: suggestion.code,
        description: suggestion.description,
        icd10cm: suggestion.code,
      });

      fetcher.submit(formData, {
        method: "post",
        action: `/api/clinicals`, // Post to the clinicals action
      });
    },
    300
  );

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="search-form w-full max-w-md mx-auto"
    >
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
      {errors.query && (
        <p className="error-message text-red-500 mt-2">
          {errors.query.message}
        </p>
      )}

      {/* Display suggestions */}
      {suggestions && (
        <ul className="autocomplete-list border border-gray-300 mt-2 rounded-md shadow-md">
          {suggestions.map((suggestion) => (
            <li key={suggestion.code} className="p-2">
              <button
                type="button"
                className="w-full text-left hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSuggestionClick(suggestion)} // Handle suggestion click
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
    // Submit the form to the specified route via POST
    fetcher.submit(formData, { method: "post", action: route });
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
