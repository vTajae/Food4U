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

    //console.log(formData);

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
      case "suggest":
      case "diets":
      case "recipie":
        response = await SuggestionService.GeneralSuggestion(
          body
        ) as basicAPI;


        if (response.status === false || !response) {
          return json({ message: `Suggestion fetched` });
        }
        return json({ message: `Suggestion fetched`, meal: response.result });

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
