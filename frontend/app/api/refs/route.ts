// GET /api/refs?query=&type=  (was app/routes/_auth.api.refs.tsx)
import { ClinicalService } from "~/api/services/clinicalService";
import RefService from "~/api/services/refService";
import type { Suggestion } from "~/api/schemas/refs";
import AutoCompleteData from "~/lib/refs/allergies.json";
import { getSession } from "~/lib/session";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("query");
  const type = url.searchParams.get("type");

  if (!query || !type) {
    return Response.json({ suggestions: [] });
  }

  const session = await getSession();
  if (!session.data.auth) {
    return Response.json({ suggestions: [], message: "Please log in." }, { status: 401 });
  }
  const backend = new RefService(session.data.token);

  if (type === "icd10cm" || type === "conditions") {
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

  // Other types: bundled autocomplete data plus the backend's diet list.
  const autocompleteData = AutoCompleteData.autocomplete as Record<string, (Suggestion | string)[]>;
  const diets = await backend.getAllDiets();

  const allSuggestions: Record<string, Suggestion[]> = {};
  for (const [key, values] of Object.entries(autocompleteData)) {
    allSuggestions[key] = values.map((value) => ({
      name: typeof value === "string" ? value : value.name,
    }));
  }
  allSuggestions["diets"] = diets;

  const suggestions = allSuggestions[type] || [];
  const filteredSuggestions = suggestions.filter(
    (s) => s.name && s.name.toLowerCase().includes(query.toLowerCase())
  );

  return Response.json({ suggestions: filteredSuggestions });
}
