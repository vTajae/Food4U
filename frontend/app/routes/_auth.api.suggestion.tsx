// suggestionAction.ts
import { ActionFunction, json } from "@remix-run/cloudflare";
import SuggestionService, {
  basicAPI,
} from "../../api/services/suggestionService";

export const action: ActionFunction = async ({ request }) => {
  try {
    const formData = await request.formData();
    const action = formData.get("action") as string;
    const queryKey = formData.get("queryKey") as string;
    const text = formData.get("query") as string;

    if (!formData) {
      return json({ error: "Invalid form submission" }, { status: 400 });
    }

    if (!action || !queryKey) {
      return json(
        { error: "Missing required parameters: action or queryKey" },
        { status: 400 }
      );
    }

    let response;
    const body = { queryKey: queryKey, text: text, action: action };
    // Handle different actions here
    switch (action) {
      case "meal":
        response = (await SuggestionService.GeneralSuggestion(
          body
        )) as basicAPI;
        if (response.status === false) {
          return json({ message: `Suggestion fetched` });
        }
        return json({ message: `Suggestion fetched`, results: response.result });

      default:
        return json({ message: `Unknown action` }, { status: 400 });
    }
  } catch (error) {
    console.error(error);
    return json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
};
