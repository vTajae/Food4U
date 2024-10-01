// Display.tsx

import { SearchResultFood } from "../../../api/schemas/suggestion";
import React, { useState } from "react";

interface DisplayProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
}

interface DisplayProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
}

const Display = <T,>({ data, renderItem }: DisplayProps<T>) => {
  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {data.length > 0 ? (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg-hide-after-1 md-hide-after-2">
          {data.map((item, index) => (
            <li key={index} className="w-full flex justify-center">
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


// Utility function to format ingredients
const formatIngredients = (ingredients: string) => {
  const result = [];
  let temp = "";
  let openParen = false;

  for (let i = 0; i < ingredients.length; i++) {
    const char = ingredients[i];

    if (char === "(") {
      openParen = true;
    }

    if (char === ")" && openParen) {
      openParen = false;
    }

    if (char === "," && !openParen) {
      result.push(temp.trim());
      temp = "";
    } else {
      temp += char;
    }
  }

  if (temp) {
    result.push(temp.trim());
  }

  return result;
};

const RenderResultItem: React.FC<{ item: SearchResultFood; index: number }> = ({
  item,
  index,
}) => {
  const [showIngredients, setShowIngredients] = useState(false);
  const [showNutrients, setShowNutrients] = useState(false);

  const formattedIngredients = item.ingredients
    ? formatIngredients(item.ingredients)
    : [];

  return (
    <div
      key={item.fdcId || index}
      className="w-full bg-white border border-gray-200 rounded-lg shadow overflow-hidden"
    >
      <div className="p-4">
        {/* Title */}
        <h5 className="text-xl font-semibold tracking-tight text-gray-900 text-center">
          <button
            onClick={() => {
              // Add your click handler logic here
            }}
            className="hover:text-blue-600 focus:outline-none"
          >
            {item.description || `Item ${index + 1}`}
          </button>
        </h5>

        {/* Optional Brand Owner and Scientific Name */}
        {item.brandOwner && (
          <p className="text-gray-700 mt-2">
            <strong className="font-semibold text-gray-900">
              Brand Owner:
            </strong>{" "}
            {item.brandOwner}
          </p>
        )}
        {item.scientificName && (
          <p className="text-gray-700 mt-1">
            <strong className="font-semibold text-gray-900">
              Scientific Name:
            </strong>{" "}
            {item.scientificName}
          </p>
        )}

        {/* Additional Descriptions */}
        {item.additionalDescriptions && (
          <p className="text-gray-500 italic mt-2">
            {item.additionalDescriptions}
          </p>
        )}

        {/* Buttons */}
        <div className="flex flex-wrap items-center mt-4 mb-5">
          {formattedIngredients.length > 0 && (
            <button
              onClick={() => setShowIngredients(!showIngredients)}
              className="bg-blue-500 text-white font-medium text-base py-2 px-6 rounded-lg hover:bg-blue-600 transition duration-200 mr-2 mb-2 focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              {showIngredients ? "Hide Ingredients" : "Show Ingredients"}
            </button>
          )}
          {item.foodNutrients && item.foodNutrients.length > 0 && (
            <button
              onClick={() => setShowNutrients(!showNutrients)}
              className="bg-green-500 text-white font-medium text-base py-2 px-6 rounded-lg hover:bg-green-600 transition duration-200 mb-2 focus:outline-none focus:ring-4 focus:ring-green-300"
            >
              {showNutrients ? "Hide Nutrients" : "Show Nutrients"}
            </button>
          )}
        </div>

        {/* Ingredients */}
        {showIngredients && (
          <div className="text-gray-700">
            <strong className="font-semibold text-gray-900">
              Ingredients:
            </strong>
            <div className="mt-3 max-h-40 overflow-y-auto custom-scrollbar">
              <ul className="list-inside list-none flex flex-wrap gap-x-3 gap-y-2">
                {formattedIngredients.map((ingredient, idx) => (
                  <li
                    key={idx}
                    className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm inline-block"
                  >
                    {ingredient}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Nutrients */}
        {showNutrients && (
          <div className="text-gray-700 mt-4">
            <strong className="font-semibold text-gray-900">Nutrients:</strong>
            <div className="mt-2 max-h-40 overflow-y-auto custom-scrollbar">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr>
                    <th className="px-2 py-1 font-semibold text-gray-700 border-b">
                      Nutrient
                    </th>
                    <th className="px-2 py-1 font-semibold text-gray-700 border-b">
                      Amount
                    </th>
                    <th className="px-2 py-1 font-semibold text-gray-700 border-b">
                      Unit
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {item.foodNutrients &&
                    item.foodNutrients.map((nutrient, nutrientIndex) => (
                      <tr
                        key={nutrientIndex}
                        className="odd:bg-white even:bg-gray-50"
                      >
                        <td className="px-2 py-1 border-b">
                          {nutrient.nutrientName}
                        </td>
                        <td className="px-2 py-1 border-b">{nutrient.value}</td>
                        <td className="px-2 py-1 border-b">
                          {nutrient.unitName}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { RenderResultItem as renderResultItem };
