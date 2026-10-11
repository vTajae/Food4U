// POST /api/clinicals  (was app/routes/_auth.api.clinicals.tsx)
import { z } from "zod";
import { ClinicalService } from "~/api/services/clinicalService";
import UserService from "~/api/services/userService";
import { getSession } from "~/lib/session";
import { applyBackendToken } from "~/lib/auth";

const clinicalSubmissionSchema = z.object({
  query: z.string().trim().max(100, "Search query is too long").optional().nullable(),
  code: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  action: z.enum(["autocomplete", "search", "consider"]),
  key: z.enum(["conditions", "icd10cm"]),
});

function validateSubmission(formData: FormData) {
  const data = {
    query: (formData.get("query") as string | null)?.trim() || null,
    code: (formData.get("code") as string | null) || null,
    description: (formData.get("description") as string | null) || null,
    action: formData.get("action") as string | null,
    key: formData.get("key") as string | null,
  };
  const validation = clinicalSubmissionSchema.safeParse(data);
  if (!validation.success) {
    return { success: false as const, errors: validation.error.flatten().fieldErrors };
  }
  return { success: true as const, data: validation.data };
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session.data.auth) {
      return Response.json({ message: "Please log in." }, { status: 401 });
    }
    applyBackendToken(session.data);

    const validationResult = validateSubmission(await request.formData());
    if (!validationResult.success) {
      return Response.json({ errors: validationResult.errors }, { status: 400 });
    }

    const { query, code, description, action, key } = validationResult.data;

    switch (action) {
      case "autocomplete":
      case "search": {
        if (!query) {
          return Response.json({ message: "Query is required for this action" }, { status: 400 });
        }
        try {
          const response = await ClinicalService.autocompleter(query, 5, key);
          if (!response || response.length === 0) {
            return Response.json({ message: "No suggestions found", suggestions: [] });
          }
          return Response.json({ suggestions: response });
        } catch (err) {
          console.error("Autocomplete error:", err);
          return Response.json(
            { message: "An error occurred while fetching suggestions." },
            { status: 500 }
          );
        }
      }
      case "consider": {
        if (!description || !code) {
          return Response.json(
            { message: "Both description and medical code are required" },
            { status: 400 }
          );
        }
        try {
          const response = await UserService.post("user/medical", { icd10cm: code, description });
          if (!response) {
            return Response.json(
              { message: "An error occurred while posting the medical code." },
              { status: 500 }
            );
          }
          return Response.json({
            message: `Medical code ${code} has been successfully submitted.`,
            isLoading: false,
          });
        } catch (err) {
          console.error("Consider action error:", err);
          return Response.json(
            { message: "An error occurred while submitting the medical code." },
            { status: 500 }
          );
        }
      }
      default:
        return Response.json({ message: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error:", error);
    return Response.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
