// POST /api/suggestion
import { env } from "cloudflare:workers";
import SuggestionService from "~/api/services/suggestionService";
import UserService from "~/api/services/userService";
import { ApiError } from "~/api/services/baseService";
import { BACKEND_WAKING_MESSAGE, isBackendWaking } from "~/lib/backend-status";
import { commitSession, getSession } from "~/lib/session";

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
    if (!["meal", "suggest", "diets", "diet", "recipie"].includes(action)) {
      return Response.json({ message: "Unknown action" }, { status: 400 });
    }

    let backend = new SuggestionService(session.data.token);
    let response;
    try {
      response = await backend.GeneralSuggestion({ queryKey, text, action });
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 403 || error.detail !== "Token has expired") throw error;
      // Only this identity's expired token is refreshed, and only once. The
      // second call is outside this catch, so repeated expiry cannot loop.
      const refresh = await new UserService(env).refreshUser(env, session.data.auth.id);
      if (!refresh.success || !refresh.token) {
        return Response.json({ error: "Please log in again.", retryable: false }, { status: 401 });
      }
      session.data.token = refresh.token;
      backend = new SuggestionService(refresh.token);
      await commitSession(session);
      response = await backend.GeneralSuggestion({ queryKey, text, action });
    }
    return Response.json({ message: "Suggestion fetched", meal: response.result });
  } catch (error) {
    if (error instanceof ApiError && error.status === 503 && error.detail === "AI suggestions are not configured") {
      return Response.json(
        { error: "Meal ideas aren't available yet. We're setting this up.", retryable: false },
        { status: 503 }
      );
    }
    if (isBackendWaking(error)) {
      return Response.json({ error: BACKEND_WAKING_MESSAGE, retryable: true }, { status: 503 });
    }
    if (error instanceof ApiError && error.status === 429) {
      return Response.json({ error: "Too many requests, try again in a moment", retryable: true }, { status: 429 });
    }
    // Do not expose backend detail (or credentials embedded in URLs) to users.
    console.error("Suggestion request failed", error instanceof ApiError ? { status: error.status } : { unexpected: true });
    return Response.json(
      { error: "Couldn't get meal ideas. Please try again.", retryable: true },
      { status: 500 }
    );
  }
}
