import { useEffect } from "react";
import { toast } from "sonner";

export interface SearchResultProps {
  message?: string | string[];
  errors?: Record<string, string[]>;
}

// Surfaces a fetcher's message or validation errors as a toast (Sonner).
// Renders nothing itself; a new toast appears whenever the fetcher returns new data.
export function SearchResult({ message, errors }: SearchResultProps) {
  useEffect(() => {
    if (!message && !errors) {
      return;
    }

    if (errors) {
      toast.error("Check your search", {
        description: (
          <ul>
            {Object.entries(errors).map(([field, messages]) => (
              <li key={field}>
                <strong>{field}:</strong> {messages.join(", ")}
              </li>
            ))}
          </ul>
        ),
      });
    } else if (Array.isArray(message)) {
      if (message.length > 0) {
        toast(
          <ul className="list-inside list-disc">
            {message.map((msg, index) => (
              <li key={index}>{msg}</li>
            ))}
          </ul>
        );
      } else {
        toast("No results found");
      }
    } else {
      toast("Results updated", {
        description: `Last updated at ${new Date().toLocaleString()}`,
      });
    }
  }, [message, errors]);

  return null;
}
