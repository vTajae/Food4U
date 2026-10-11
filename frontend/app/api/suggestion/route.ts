// POST /api/suggestion  (was app/routes/_auth.api.suggestion.tsx)
import SuggestionService, { type basicAPI } from "~/api/services/suggestionService";
import { getSession } from "~/lib/session";
import { applyBackendToken } from "~/lib/auth";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const action = formData.get("action") as string | null;
    const queryKey = formData.get("queryKey") as string | null;
    const text = (formData.get("query") ?? formData.get("text") ?? "") as string;

    if (!action || !queryKey) {
      return Response.json(
        { error: "Missing required parameters: action or queryKey" },
        { status: 400 }
      );
    }

    const session = await getSession();
    if (!session.data.auth) {
      return Response.json({ error: "Please log in." }, { status: 401 });
    }
    applyBackendToken(session.data);

    switch (action) {
      case "meal":
      case "suggest":
      case "diets":
      case "diet":
      case "recipie": {
        const response = (await SuggestionService.GeneralSuggestion({
          queryKey,
          text,
          action,
        })) as basicAPI | void;

        if (!response || response.status === false) {
          return Response.json({ message: "Suggestion fetched" });
        }
        return Response.json({ message: "Suggestion fetched", meal: response.result });
      }
      default:
        return Response.json({ message: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
