
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FetcherWithComponents } from "@remix-run/react";

// Define Zod schema for input validation
const searchSchema = z.object({
  query: z
    .string()
    .min(1, "Search query is required")
    .max(100, "Search query is too long")
    .trim(),
});

interface SearchBarProps {
  fetcher: FetcherWithComponents<{ message?: string; errors?: Record<string, string[]> }>; // Pass fetcher as a prop
  placeholderText?: string;
}

export function SearchBar({ fetcher, placeholderText = "Enter food preference" }: SearchBarProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ query: string }>({
    resolver: zodResolver(searchSchema),
  });

  const onSubmit = (data: { query: string }) => {
    const formData = new FormData();
    formData.append("query", data.query);
    formData.append("action", "search");

    // Submit the form using the passed fetcher
    fetcher.submit(formData, { method: "post", action: "/dashboard" });
  };

  return (
<form onSubmit={handleSubmit(onSubmit)} className="search-form w-full max-w-md mx-auto">
  <div className="flex items-center space-x-2">
    <input
      type="text"
      {...register("query")}
      placeholder={placeholderText}
      name="query"
      className="search-input w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black" // Ensures text is black
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
    <p className="error-message text-red-500 mt-2">{errors.query.message}</p>
  )}
</form>

  );
}



export function Button({ text }: { text: string }) {
  const handleClick = () => {
    alert(`You clicked: ${text}`);
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
