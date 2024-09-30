import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FetcherWithComponents } from "@remix-run/react";
import { FetcherDataType } from "../../../api/schemas/refs";

// Simplified submitFormData helper
const submitFormData = (
  fetcher: FetcherWithComponents<FetcherDataType>,
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

// Define TypeScript interfaces
interface SearchBarProps {
  fetcher: FetcherWithComponents<FetcherDataType>;
  placeholderText?: string;
  queryKey: string; // Allow passing a custom query key
  action: string; // Allow passing a custom action
}

// Updated search schema
const searchSchema = z.object({
  query: z
    .string()
    .min(1, "Query cannot be empty") // Ensure the query is not empty
    .regex(/^[^\\'"]*$/, "Query must not contain escape characters"), // Validate no escape characters
});

export function SearchBar({
  fetcher,
  placeholderText = "Enter query",
  queryKey,
  action,
}: SearchBarProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ query: string }>({
    resolver: zodResolver(searchSchema),
  });

  // Set loading indicator based on fetcher state
  const isLoading = fetcher.state === "submitting" || fetcher.state === "loading";

  // On form submission
  const onSubmit = (data: { query: string }) => {
    submitFormData(
      fetcher,
      { text: data.query, action, queryKey }, // Sending query, action, and queryKey
      "/api/suggestion"
    );
  };


  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col items-center gap-4 p-6 bg-blue-50 rounded-lg shadow-md"
    >
      <input
        type="text"
        {...register("query")}
        placeholder={placeholderText}
        className="
      w-full md:w-3/4 px-4 py-3 border border-blue-300 
      rounded-lg text-gray-700 focus:outline-none 
      focus:ring-2 focus:ring-blue-400 
      transition duration-200 ease-in-out 
      shadow-sm"
      />

      {errors.query && (
        <p className="text-red-500 text-sm mt-1">{errors.query.message}</p>
      )}

      <button
        type="submit"
        className="
      bg-red-500 text-white font-semibold 
      rounded-lg py-2 px-6 mt-2 
      transition-transform duration-300 
      hover:bg-red-600 hover:scale-105 
      shadow-lg shadow-red-300/50 
      focus:outline-none focus:ring-2 
      focus:ring-offset-2 focus:ring-red-400"
        disabled={isLoading} // Disable button when loading
      >
        {isLoading ? "Searching..." : "Search"} {/* Change button text */}
      </button>
    </form>
  );
}



interface ButtonProps {
  fetcher: FetcherWithComponents<FetcherDataType>;
  text: string;
  route: string;
  action: string;
  queryKey: string;
}

export function ActionButton({
  fetcher,
  text,
  route,
  action,
  queryKey,
}: ButtonProps) {
  const handleClick = () => {
    submitFormData(fetcher, { text, action, queryKey }, route);
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
