export interface SearchResultProps {
  message?: string | string[];
  errors?: Record<string, string[]>;
}

export function SearchResult({ message, errors }: SearchResultProps) {
  if (!message && !errors) {
    return null; // No data yet, so don't render anything
  }

  return (
    <div className="mt-6 p-4">
      {errors ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md">
          {Object.entries(errors).map(([field, messages]) => (
            <div key={field} className="mb-2">
              <strong className="block text-red-600">{field}:</strong>
              <span>{messages.join(", ")}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md shadow-md">
        {Array.isArray(message) ? (
          message.length > 0 ? (
            <ul>
              {message.map((msg, index) => (
                <li key={index}>{msg}</li>
              ))}
            </ul>
          ) : (
            <p>No results found</p>
          )
        ) : (
          <p>{message || "No results found"}</p>
        )}
      </div>
      
      )}
    </div>
  );
}
