import { json, ActionFunction, LoaderFunction, Session } from "@remix-run/cloudflare";
import { z } from "zod";
import { useFetcher } from "@remix-run/react";
import { useState, useEffect } from "react";
import { ActionButton, SearchBar } from "../components/search/bar";
import { SearchResult } from "../components/search/results";
import UserService from "api/services/userService";
import { PythonLogin } from "api/models/user";

const searchSchema = z.object({
  query: z
    .string()
    .min(1, "Search query is required")
    .max(100, "Search query is too long")
    .trim(),
});

export const loader: LoaderFunction = async ({ request, context }) => {
  const myEnv = context.cloudflare.env as Env;
  const mySession = context.session as Session;
  const userService = new UserService(myEnv);


  const loadProfile = await UserService.getSingle<PythonLogin>("profile");
  

  return json({ message: `You searched for: ${request.body}` });

};


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
      case "search":
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
  const fetcher = useFetcher<{
    message?: string;
    errors?: Record<string, string[]>;
  }>();

  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    // Set the welcome screen to fade out after 1 second
    const timer = setTimeout(() => setShowWelcome(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`
        bg-gradient-to-b from-cyan-400 to-blue-700
        text-white h-screen flex flex-col justify-center items-center
        transition-opacity duration-500 ease-in-out
      `}
    >
      {showWelcome ? (
        // Add the fade-out animation to the welcome screen
        <div className="flex items-center justify-center h-full welcome-screen">
          <h1 className="text-6xl font-bold">Welcome</h1>
        </div>
      ) : (
        // Fade-in animation for the dashboard content
        <div className="p-6 text-center dashboard-content">
          <h1 className="text-5xl font-bold mb-6">Food4U</h1>
          <p className="text-lg mb-4">Talk to me about food</p>

          {/* SearchBar component */}
          <SearchBar fetcher={fetcher} />

          {/* SearchResult component */}
          {fetcher.data && (
            <SearchResult
              message={fetcher.data.message}
              errors={fetcher.data.errors}
            />
          )}

          {/* Buttons */}
          <div className="mt-6 space-y-4">
            <ActionButton fetcher={fetcher} text="I'm hungry" route={"/api/clinicals"} action={"login"} />
            <ActionButton fetcher={fetcher} text="What diet is best for me?" route={"/api/food/suggestions"} action={"diets"} />
            <ActionButton fetcher={fetcher} text="Recommended diet for ${Random}" route={"/api/food/suggestions"} action={"diets-recommended"} />
          </div>
        </div>
      )}
    </div>
  );
}
