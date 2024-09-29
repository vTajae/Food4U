import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FetcherWithComponents } from "@remix-run/react";
import { useState } from "react";
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
  queryKey: "suggest"; // Allow passing a custom query key
}

const searchSchema = z.object({
  query: z.string().min(1, "Query cannot be empty"), // Add validation for required query
});

export function SearchBar({
  fetcher,
  placeholderText = "Enter condition",
  queryKey,
}: SearchBarProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ query: string }>({
    resolver: zodResolver(searchSchema),
  });

  const onSubmit = (data: { query: string }) => {
    setLoading(true);
    setMessage(null); // Clear previous messages
    submitFormData(
      fetcher,
      { query: data.query, action: "suggest", key: queryKey },
      "/api/suggest"
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="search-bar">
      <input
        type="text"
        {...register("query")}
        placeholder={placeholderText}
        className="search-input"
      />

      {errors.query && (
        <p className="error-message text-red-500 mt-2">
          {errors.query.message}
        </p>
      )}

      <button
        type="submit"
        className="
          bg-red-500 text-white 
          font-semibold rounded-lg 
          py-2 px-4 m-2 
          transition-transform duration-300 
          hover:bg-red-600 hover:scale-105 
          shadow-lg shadow-red-300/50 
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400"
      >
        Search
      </button>

      {loading && <p className="loader mt-2 text-gray-500">Loading...</p>}
      {message && <p className="message text-yellow-500 mt-2">{message}</p>}
    </form>
  );
}


interface ButtonProps {
  fetcher: FetcherWithComponents<FetcherDataType>;
  text: string;
  route: string;
  action: string;
}

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
