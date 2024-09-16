
import { json, ActionFunction, Session } from "@remix-run/cloudflare";
import userService from "../../api/services/userService";
import { z } from "zod";
import { PythonLogin } from "../../api/models/user";

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

console.log(mySession.data, "mySession")

console.log(request.headers, "Headerz")
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
        case "search":
          return json({ message: `You searched for: ${query}` });
        
        case "login": {
          // Make sure to handle the async operation and await the result
          const response = await userService.getSingle<PythonLogin>("profile");
      
          // Validate if the response has a message or not
          if (!response) {
            return json({ message: `You are not logged in!` });
          } else {
            return json({ message: `${response.message}` });
          }
        }
        
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
