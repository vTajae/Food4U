import { json, ActionFunction, Session } from "@remix-run/cloudflare";
import { z } from "zod";
import { ClinicalService } from "../../api/services/clinicalService";
import UserService from "../../api/services/userService";

// Combined schema for all actions, with optional fields
const clinicalSubmissionSchema = z.object({
  query: z.string().trim().max(100, "Search query is too long").optional().nullable(),
  code: z.string().optional().nullable(),  // Allow code to be null or optional
  description: z.string().optional().nullable(),  // Allow description to be null or optional
  action: z.enum(["autocomplete", "search", "consider"]),
});

// Helper function to handle validation
function validateSubmission(formData: FormData) {
  const data = {
    query: (formData.get("query") as string | null)?.trim() || null,
    code: (formData.get("code") as string | null) || null,
    description: (formData.get("description") as string | null) || null,
    action: formData.get("action") as string | null,
  };

  console.log(data, "DATAAAUH")

  // Parse and validate the data using the schema
  const validation = clinicalSubmissionSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, errors: validation.error.flatten().fieldErrors };
  }

  return { success: true, data: validation.data };
}

// Action handler
export const action: ActionFunction = async ({ request, context }) => {
  const mySession = context.session as Session;

  try {
    const formData = await request.formData();

    // Validate form data
    const validationResult = validateSubmission(formData);
    if (!validationResult.success) {
      return json(
        { errors: validationResult.errors },
        { status: 400 }
      );
    }

    if (!validationResult.data) {
      return json({ message: "Validation failed" }, { status: 400 });
    }
    const { query, code, description, action } = validationResult.data;


    console.log(validationResult.data, "Data");
    // Handle actions
    switch (action) {
      case "autocomplete":
      case "search": {
        if (!query) {
          return json({ message: "Query is required for this action" }, { status: 400 });
        }

        // Call appropriate service based on action
        const response = action === "autocomplete"
          ? await ClinicalService.autocompleter(query, 5)
          : await ClinicalService.searchIcd10(query);

        if (!response) {
          return json({ message: `You are not logged in!` }, { status: 401 });
        }

        return json({ suggestions: response });
      }

      case "consider": {
        if (!description || !code) {
          return json(
            { message: "Both description and medical code are required" },
            { status: 400 }
          );
        }

        console.log(description, code, "Description and Code");

        const response = await UserService.post("user/medical", {  icd10cm: code, description: description, });
        if (!response) {
          return json(
            { message: `An error occurred while posting the medical code.` },
            { status: 500 }
          );
        }

        return json({
          message: `Medical code ${code} has been successfully submitted.`, isLoading: false
        });
      }

      default:
        return json({ message: `Unknown action` }, { status: 400 });
    }



  } catch (error) {
    console.error("Error:", error);
    context.session.flash(
      "error",
      "An error occurred while processing your request."
    );
    return json({ error: "An unexpected error occurred." }, { status: 500 });
  }
};
