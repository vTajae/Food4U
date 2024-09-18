import { json, ActionFunction, Session } from "@remix-run/cloudflare";
import { ClinicalService } from "../../api/services/clinicalService";
import UserService from "../../api/services/userService";
import { inputSchema_Dash } from "../components/search/bar";


export const action: ActionFunction = async ({ request, context }) => {
  const mySession = context.session as Session;

  try {
    const formData = await request.formData();

    const data = {
      query: formData.get("query") as string | null,
      code: formData.get("code") as string | null,
      description: formData.get("description") as string | null,
    };

    // Validate the incoming data
    const validation = inputSchema_Dash.safeParse(data);
    if (!validation.success) {
      return json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const actionType = formData.get("action");
    console.log(actionType, "Action");

    switch (actionType) {
      case "autocomplete": {

        console.log(data.query, "Query");
        const response = await ClinicalService.autocompleter(data.query || "", 5);
        if (!response) return json({ message: "No results found" });
        return json({ suggestions: response });
      }
      case "search": {
        const response = await ClinicalService.searchIcd10(data.query || "");
        if (!response) return json({ message: "No results found" });
        return json({ message: response.message });
      }
      case "consider": {
        const { code, description } = data;
        if (!code || !description) {
          return json({ message: "Both code and description are required" }, { status: 400 });
        }

        const response = await UserService.post("user/medical", { code, description });
        if (!response) {
          return json({ message: "An error occurred while posting the medical code." }, { status: 500 });
        }

        return json({ message: `Medical code ${code} has been successfully submitted.` });
      }
      default:
        return json({ message: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    return json({ error: "An unexpected error occurred" }, { status: 500 });
  }
};
