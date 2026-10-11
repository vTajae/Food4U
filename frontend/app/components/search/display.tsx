// Display.tsx

import { SearchResultFood } from "../../../api/schemas/suggestion";
import React, { useId, useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

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

    // Check for both commas and semicolons as delimiters outside parentheses
    if ((char === "," || char === ";") && !openParen) {
      result.push(temp.trim());
      temp = "";
    } else {
      temp += char;
    }
  }

  // Push the last accumulated ingredient
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
  const ingredientsId = useId();
  const nutrientsId = useId();

  return (
    <Card key={item.fdcId || index} className="w-full text-left">
      <CardHeader>
        <CardTitle>{item.description || `Item ${index + 1}`}</CardTitle>
      </CardHeader>

      {(item.brandOwner || item.scientificName || item.additionalDescriptions) && (
        <CardContent className="flex flex-col gap-1 text-body-md">
          {/* Optional Brand Owner and Scientific Name */}
          {item.brandOwner && (
            <p>
              <span className="font-bold">Brand Owner:</span> {item.brandOwner}
            </p>
          )}
          {item.scientificName && (
            <p>
              <span className="font-bold">Scientific Name:</span>{" "}
              {item.scientificName}
            </p>
          )}

          {/* Additional Descriptions */}
          {item.additionalDescriptions && (
            <p className="text-ink-muted">{item.additionalDescriptions}</p>
          )}
        </CardContent>
      )}

      {/* Disclosure buttons */}
      {(formattedIngredients.length > 0 ||
        (item.foodNutrients && item.foodNutrients.length > 0)) && (
        <CardFooter>
          {formattedIngredients.length > 0 && (
            <Button
              variant="secondary"
              aria-expanded={showIngredients}
              aria-controls={ingredientsId}
              onClick={() => setShowIngredients(!showIngredients)}
            >
              {showIngredients ? "Hide Ingredients" : "Show Ingredients"}
            </Button>
          )}
          {item.foodNutrients && item.foodNutrients.length > 0 && (
            <Button
              variant="secondary"
              aria-expanded={showNutrients}
              aria-controls={nutrientsId}
              onClick={() => setShowNutrients(!showNutrients)}
            >
              {showNutrients ? "Hide Nutrients" : "Show Nutrients"}
            </Button>
          )}
        </CardFooter>
      )}

      {/* Ingredients */}
      {showIngredients && (
        <CardContent id={ingredientsId}>
          <h4 className="text-heading-sm">Ingredients</h4>
          <div className="custom-scrollbar mt-3 max-h-40 overflow-y-auto">
            <ul className="flex flex-wrap gap-2">
              {formattedIngredients.map((ingredient, idx) => (
                <li key={idx}>
                  <Badge variant="neutral" className="whitespace-normal">
                    {ingredient}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      )}

      {/* Nutrients */}
      {showNutrients && (
        <CardContent id={nutrientsId}>
          <h4 className="text-heading-sm">Nutrients</h4>
          <div className="custom-scrollbar mt-2 max-h-40 overflow-y-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="font-data text-data-caps text-ink-muted uppercase">
                  <th scope="col" className="border-b border-line px-2 py-1.5">
                    Nutrient
                  </th>
                  <th scope="col" className="border-b border-line px-2 py-1.5 text-right">
                    Amount
                  </th>
                  <th scope="col" className="border-b border-line px-2 py-1.5">
                    Unit
                  </th>
                </tr>
              </thead>
              <tbody className="text-body-sm">
                {item.foodNutrients &&
                  item.foodNutrients.map((nutrient, nutrientIndex) => (
                    <tr key={nutrientIndex}>
                      <td className="border-b border-line px-2 py-1.5">
                        {nutrient.nutrientName}
                      </td>
                      <td className="border-b border-line px-2 py-1.5 text-right font-data text-data-md">
                        {nutrient.value}
                      </td>
                      <td className="border-b border-line px-2 py-1.5">
                        {nutrient.unitName}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export { RenderResultItem as renderResultItem };
