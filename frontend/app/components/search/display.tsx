import { SearchResultFood } from "../../../api/schemas/suggestion";
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



const renderResultItem = (item: SearchResultFood, index: number) => {
  return (
    <div key={item.fdcId || index}>
      <h3 className="font-bold text-lg">
        {item.description || `Item ${index + 1}`}
      </h3>
      {item.brandOwner && <p><strong>Brand Owner:</strong> {item.brandOwner}</p>}
      {item.scientificName && <p><strong>Scientific Name:</strong> {item.scientificName}</p>}
      {item.ingredients && <p><strong>Ingredients:</strong> {item.ingredients}</p>}
      {item.foodNutrients && item.foodNutrients.length > 0 && (
        <div>
          <strong>Nutrients:</strong>
          <ul>
            {item.foodNutrients.map((nutrient, nutrientIndex) => (
              <li key={nutrientIndex}>
                {nutrient.nutrientName}: {nutrient.value} {nutrient.unitName}
              </li>
            ))}
          </ul>
        </div>
      )}
      <p>{item.additionalDescriptions || "No additional descriptions available."}</p>
    </div>
  );
};

export { renderResultItem };
