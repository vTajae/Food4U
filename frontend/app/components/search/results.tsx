export interface SearchResultProps {
  message?: string | string[];
  errors?: Record<string, string[]>;
  fetching: boolean;
}

export function SearchResult({ message, errors, fetching }: SearchResultProps) {
  if (fetching) {
    return (
      <div className="mt-6 p-4 flex items-center justify-center text-sm text-red-500">
        <p className="animate-pulse">Loading...</p>
      </div>
    );
  }

  if (!message && !errors) {
    return null;
  }

  return (
    <div className="mt-6 p-4">
      {errors ? (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-800 p-4 rounded-md shadow-md">
          {Object.entries(errors).map(([field, messages]) => (
            <div key={field} className="mb-2">
              <strong className="block font-semibold text-blue-700">{field}:</strong>
              <span className="text-sm text-blue-600">{messages.join(", ")}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-800 p-4 rounded-md shadow-md">
          {Array.isArray(message) ? (
            message.length > 0 ? (
              <ul className="list-disc list-inside text-blue-700">
                {message.map((msg, index) => (
                  <li key={index} className="text-sm">
                    {msg}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-blue-600">No results found</p>
            )
          ) : (
            <p className="text-sm text-blue-600">{message || "No results found"}</p>
          )}
        </div>
      )}
    </div>
  );
}
