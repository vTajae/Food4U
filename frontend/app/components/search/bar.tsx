import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FetcherWithComponents } from "@remix-run/react";
import { FetcherDataType } from "../../../api/schemas/refs";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";

// Simplified submitFormData helper
const submitFormData = (
  fetcher: FetcherWithComponents<FetcherDataType>,
  formDataEntries: Record<string, string>,
  action: string,
  method: "post" = "post"
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
  const form = useForm<{ query: string }>({
    resolver: zodResolver(searchSchema),
    defaultValues: { query: "" },
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
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto flex w-full max-w-reading-max flex-col gap-3 rounded-(--rounded-lg) border border-line bg-surface p-4 text-left font-body text-ink sm:flex-row sm:items-start"
      >
        <FormField
          control={form.control}
          name="query"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel className="sr-only">Ask about food</FormLabel>
              <FormControl>
                <Input type="text" placeholder={placeholderText} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} aria-busy={isLoading}>
          {isLoading ? "Searching..." : "Search"} {/* Change button text */}
        </Button>
      </form>
    </Form>
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
  route = "/api/suggestion", // Default route
  action,
  queryKey,
}: ButtonProps) {
  const isLoading = fetcher.state === "submitting" || fetcher.state === "loading";

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
        focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-red-400"
      disabled={isLoading} // Disable button when loading
    >
      {isLoading ? "Submitting..." : text}
    </button>
  );
}
