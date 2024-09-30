import React from "react";

// Define a generic Display component that accepts an array of items (generic type T)
interface DisplayProps<T> {
  data: T[]; // Expecting an array of data items
  renderItem: (item: T, index: number) => React.ReactNode; // Function to render each item
}

const Display = <T,>({ data, renderItem }: DisplayProps<T>) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {data.length > 0 ? (
        <ul className="space-y-4">
          {data.map((item, index) => (
            <li key={index} className="p-4 bg-white rounded-lg shadow-md">
              {renderItem(item, index)}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 text-center">No results found</p>
      )}
    </div>
  );
};

export default Display;



  // Sample data mapping (this should match the structure of fetcher.data)
  const renderResultItem = (item: any, index: number) => {
    return (
      <div>
        <h3 className="font-bold text-lg">
          {item.title || `Item ${index + 1}`}
        </h3>
        <p>{item.description || "No description available."}</p>
      </div>
    );
  };

  export { renderResultItem };