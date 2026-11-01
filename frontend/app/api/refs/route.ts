// GET /api/refs?query=&type=  (was app/routes/_auth.api.refs.tsx)
import { ClinicalService } from "~/api/services/clinicalService";
import RefService from "~/api/services/refService";
import type { Suggestion } from "~/api/schemas/refs";
import AutoCompleteData from "~/lib/refs/allergies.json";
import { getSession } from "~/lib/session";
import { commonConditions, commonFoodAllergies } from "~/lib/refs/conditions";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = (url.searchParams.get("query") ?? "").trim();
  const type = url.searchParams.get("type");

  if (!type) {
    return Response.json({ suggestions: [] });
  }

  const session = await getSession();
  if (!session.data.auth) {
    return Response.json({ suggestions: [], message: "Please log in." }, { status: 401 });
  }
  if (type === "icd10cm" || type === "conditions") {
    if (!query) {
      const common = type === "icd10cm" ? commonConditions : commonFoodAllergies;
      return Response.json({ suggestions: common.map(({ code, officialName }) => ({ name: officialName, code })) });
    }
    try {
      const suggestions = await ClinicalService.autocompleter(query, 10, "conditions");
      return Response.json({ suggestions: suggestions ?? [] });
    } catch (error) {
      console.error("Error fetching medical codes:", error);
      return Response.json(
        { suggestions: [], error: "Error fetching medical codes" },
        { status: 500 }
      );
    }
  }

  // Only diets depend on the backend. Bundled lists can be browsed even while it sleeps.
  const autocompleteData = AutoCompleteData.autocomplete as Record<string, (Suggestion | string)[]>;
  const suggestions: Suggestion[] = type === "diets"
    ? await new RefService(session.data.token).getAllDiets()
    : (autocompleteData[type] ?? []).map((value) => ({
      name: typeof value === "string" ? value : value.name,
    }));
  const filteredSuggestions = suggestions.filter(
    (s) => s.name && s.name.toLowerCase().includes(query.toLowerCase())
  );

  return Response.json({ suggestions: filteredSuggestions });
}
