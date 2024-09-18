import { json, ActionFunction, Session } from "@remix-run/cloudflare";
import { z } from "zod";
import { ClinicalService } from "../../api/services/clinicalService";
import UserService from "../../api/services/userService";

const searchSchema = z.object({
  query: z
    .string()
    .min(1, "Search query is required")
    .max(100, "Search query is too long")
    .trim(),
});

export const action: ActionFunction = async ({ request, context }) => {
  const myEnv = context.cloudflare.env as Env;
  const mySession = context.session as Session;

  // console.log(mySession.data, "mySession");

  // console.log(request.headers, "Headerz");
  try {
    const formData = await request.formData();
    const query = formData.get("query") as string;

    if (query) {
      console.log(query, "Query");

      if (!formData) {
        context.session.flash("error", "Try using our client.");
        return json({ error: "Login failed. Try using our client." });
      }

      const validation = searchSchema.safeParse({ query });

      if (!validation.success) {
        return json(
          { errors: validation.error.flatten().fieldErrors },
          { status: 400 }
        );
      }

      const action = formData.get("action");

      console.log(action, "ACTION");

      switch (action) {
        case "autocomplete": {
          // Make sure to handle the async operation and await the result
          const response = await ClinicalService.autocompleter(query, 5);

          // Validate if the response has a message or not
          if (!response) {
            return json({ message: `You are not logged in!` });
          } else {
            return json({ suggestions: response });
          }
        }
        case "search": {
          // Make sure to handle the async operation and await the result
          const response = await ClinicalService.searchIcd10(query);

          // Validate if the response has a message or not
          if (!response) {
            return json({ message: `You are not logged in!` });
          } else {
            return json({ message: `${response.message}` });
          }
        }
        case "consider": {
          const description = formData.get("description") as string;
          const icd10cm = formData.get("icd10cm") as string;

          if (!description || !icd10cm) {
            console.log("Error: Missing description or ICD-10 code.");
            return json(
              { message: "Both description and medical code are required" },
              { status: 400 }
            );
          }

          const response = await UserService.post("user/medical", {
            description,
            icd10cm,
          });

          if (!response) {
            return json(
              { message: `An error occurred while posting the medical code.` },
              { status: 500 }
            );
          }

          return json({
            message: `Medical code ${icd10cm} has been successfully submitted.`,
          });
        }

        default:
          return json({ message: `Unknown action` });
      }
    }
  } catch (error) {
    context.session.flash(
      "error",
      "An error occurred while processing your request."
    );
    return json({ error: "Login failed due to an unexpected error." });
  }
};
