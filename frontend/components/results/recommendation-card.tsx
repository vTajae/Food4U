"use client";

import { useId, useState } from "react";
import type { SearchResultFood } from "~/api/schemas/suggestion";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { CheckStrip } from "~/components/results/check-strip";
import { VerdictBadge, type Verdict } from "~/components/results/verdict-badge";

// Splits an ingredients string on commas/semicolons that are not inside parentheses.
function formatIngredients(ingredients: string) {
  const result: string[] = [];
  let temp = "";
  let depth = 0;
  for (const char of ingredients) {
    if (char === "(") depth++;
    if (char === ")" && depth > 0) depth--;
    if ((char === "," || char === ";") && depth === 0) {
      if (temp.trim()) result.push(temp.trim());
      temp = "";
    } else {
      temp += char;
    }
  }
  if (temp.trim()) result.push(temp.trim());
  return result;
}

export interface RecommendationCardProps {
  item: SearchResultFood;
  index: number;
  /** Phase 1 safety layer fields; the badge/reason/strip render only when present. */
  verdict?: Verdict;
  reason?: string;
  checkedAgainst?: string[];
}

export function RecommendationCard({
  item,
  index,
  verdict,
  reason,
  checkedAgainst = [],
}: RecommendationCardProps) {
  const [showIngredients, setShowIngredients] = useState(false);
  const [showNutrients, setShowNutrients] = useState(false);
  const ingredientsId = useId();
  const nutrientsId = useId();

  const ingredients = item.ingredients ? formatIngredients(item.ingredients) : [];
  const nutrients = item.foodNutrients ?? [];
  const title = item.description || `Item ${index + 1}`;

  return (
    <Card className="h-full text-left">
      <CardHeader>
        {verdict && <VerdictBadge verdict={verdict} className="w-fit" />}
        <CardTitle>{title}</CardTitle>
        {reason && <p className="text-body-md text-ink-muted">{reason}</p>}
      </CardHeader>

      {(item.brandOwner || item.scientificName || item.additionalDescriptions) && (
        <CardContent className="flex flex-col gap-1 text-body-md">
          {item.brandOwner && (
            <p>
              <span className="font-bold">Brand:</span> {item.brandOwner}
            </p>
          )}
          {item.scientificName && (
            <p>
              <span className="font-bold">Scientific name:</span> {item.scientificName}
            </p>
          )}
          {item.additionalDescriptions && (
            <p className="text-ink-muted">{item.additionalDescriptions}</p>
          )}
        </CardContent>
      )}

      {(ingredients.length > 0 || nutrients.length > 0) && (
        <CardFooter>
          {ingredients.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              aria-expanded={showIngredients}
              aria-controls={ingredientsId}
              onClick={() => setShowIngredients((v) => !v)}
            >
              {showIngredients ? "Hide ingredients" : "Ingredients"}
            </Button>
          )}
          {nutrients.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              aria-expanded={showNutrients}
              aria-controls={nutrientsId}
              onClick={() => setShowNutrients((v) => !v)}
            >
              {showNutrients ? "Hide nutrients" : "Nutrients"}
            </Button>
          )}
        </CardFooter>
      )}

      {showIngredients && (
        <CardContent id={ingredientsId}>
          <h4 className="text-heading-sm">Ingredients</h4>
          <ul className="custom-scrollbar mt-3 flex max-h-40 flex-wrap gap-2 overflow-y-auto">
            {ingredients.map((ingredient, i) => (
              <li key={i}>
                <Badge variant="neutral" className="whitespace-normal">
                  {ingredient}
                </Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      )}

      {showNutrients && (
        <CardContent id={nutrientsId}>
          <h4 className="text-heading-sm">Nutrients</h4>
          <div className="custom-scrollbar mt-2 max-h-48 overflow-y-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="font-data text-data-caps uppercase text-ink-muted">
                  <th scope="col" className="border-b border-line px-2 py-1.5">Nutrient</th>
                  <th scope="col" className="border-b border-line px-2 py-1.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="text-body-sm">
                {nutrients.map((n, i) => (
                  <tr key={i}>
                    <td className="border-b border-line px-2 py-1.5">{n.nutrientName}</td>
                    <td className="border-b border-line px-2 py-1.5 text-right font-data text-data-md">
                      {n.value} {n.unitName?.toLowerCase()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      )}

      <CheckStrip items={checkedAgainst} />
    </Card>
  );
}
