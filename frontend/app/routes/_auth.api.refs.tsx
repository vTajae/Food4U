// api/refs.ts
import { LoaderFunction, json } from "@remix-run/cloudflare";
import { ClinicalService } from "../../api/services/clinicalService";
import AutoCompleteData from "../context/refs/allergies.json";
import { Suggestion } from "../../api/schemas/refs";
import RefService from "../../api/services/refService";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const query = url.searchParams.get("query");
  const type = url.searchParams.get("type");

  // //console.log('Query:', query);
  // //console.log('Type:', type);

  if (!query || !type) {
    return json({ suggestions: [] });
  }

  if (type === "icd10cm") {
    // Fetch from ClinicalService
    try {
      const suggestions = await ClinicalService.autocompleter(
        query,
        10,
        "conditions"
      );

      if (!suggestions || suggestions.length === 0) {
        return json({ suggestions: [] });
      }

      return json({ suggestions: suggestions });
    } catch (error) {
      console.error("Error fetching medical codes:", error);
      return json(
        { suggestions: [], error: "Error fetching medical codes" },
        { status: 500 }
      );
    }
  } else if (type === "conditions") {
    // Fetch from ClinicalService
    try {
      const suggestions = await ClinicalService.autocompleter(
        query,
        10,
        "conditions"
      );

      if (!suggestions || suggestions.length === 0) {
        return json({ suggestions: [] });
      }

      return json({ suggestions: suggestions });
    } catch (error) {
      console.error("Error fetching medical codes:", error);
      return json(
        { suggestions: [], error: "Error fetching medical codes" },
        { status: 500 }
      );
    }
  } else {
    // Handle other types by fetching from AutoCompleteData

    const autocompleteData = AutoCompleteData.autocomplete;
    const diets = await RefService.getAllDiets();

    const allSuggestions: Record<string, Suggestion[]> = {};

    // Process existing autocomplete data
    for (const [key, values] of Object.entries(autocompleteData)) {
      allSuggestions[key] = values.map((value: Suggestion | string) => ({
        name: typeof value === "string" ? value : value.name,
      }));
    }

    // Add diets to the allSuggestions object under the key "diets"
    allSuggestions["diets"] = diets;

    // Merge the autocomplete suggestions with diets, assuming 'type' may refer to diets or other autocomplete data
    const suggestions = allSuggestions[type] || [];

    // Filter the suggestions based on the query
    const filteredSuggestions = suggestions.filter(
      (s) => s.name && s.name.toLowerCase().includes(query.toLowerCase())
    );

    //console.log(suggestions);

    return json({ suggestions: filteredSuggestions });
  }
};
