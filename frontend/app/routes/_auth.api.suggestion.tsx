// suggestionAction.ts
import { ActionFunction, json } from "@remix-run/cloudflare";
import SuggestionService from "../../api/services/suggestionService";

export const action: ActionFunction = async ({ request }) => {
  try {
    const formData = await request.formData();
    const action = formData.get("action");
    const queryKey = formData.get("queryKey");
    const query = formData.get("query");




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
    // Handle different actions here
    switch (action) {
      case "meal":

        
        response = await SuggestionService.GeneralSuggestion(queryKey as string);

        console.log(response, "YERRRR");
        return json({ message: `Suggestion fetched`, data: response });
      case "diets":
        response = await SuggestionService.GeneralSuggestion(queryKey as string);
        return json({ message: `Diet suggestions fetched`, data: response });
      case "recipe":
        response = await SuggestionService.GeneralSuggestion(queryKey as string);
        return json({ message: `Recommended diet fetched`, data: response });
      default:
        return json({ message: `Unknown action` }, { status: 400 });
    }
  } catch (error) {
    console.error(error);
    return json({ error: "An error occurred while processing your request" }, { status: 500 });
  }
};
