import {
  json,
  ActionFunction
} from "@remix-run/cloudflare";
import { z } from "zod";


import { FormProvider } from "../components/form/context";
import Form from "../components/form/index";

const searchSchema = z.object({
  query: z
    .string()
    .min(1, "Search query is required")
    .max(100, "Search query is too long")
    .trim(),
});

export const action: ActionFunction = async ({ request, context }) => {
  try {
    const formData = await request.formData();
    const query = formData.get("query");

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

    switch (action) {
      case "addCusine":
        return json({ message: `You searched for: ${query}` });
      case "addMealType":
        return json({ message: `You searched for: ${query}` });
      case "addPortion":
          return json({ message: `You searched for: ${query}` });
      default:
        return json({ message: `Unknown action` });
    }
  } catch (error) {
    context.session.flash(
      "error",
      "An error occurred while processing your request."
    );
    return json({ error: "Login failed due to an unexpected error." });
  }
};



export default function Dashboard() {
  return (
    <div>
      <h1>Welcome to the Dashboard</h1>
      <FormProvider>
        <Form />
      </FormProvider>
    </div>
  );
}
