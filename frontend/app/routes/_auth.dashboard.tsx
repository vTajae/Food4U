import {
  json,
  ActionFunction,
  LoaderFunction,
  redirect,
} from "@remix-run/cloudflare";
import { z } from "zod";
import { useFetcher } from "@remix-run/react";
import { useState, useEffect } from "react";
import { ActionButton } from "../components/search/bar";
import { SearchResult } from "../components/search/results";
import UserService from "../../api/services/userService";
import { checkAuthentication } from "../context/session/checkAuthentication";
import { ApiService } from "../../api/services/myServerService";

const searchSchema = z.object({
  query: z
    .string()
    .min(1, "Search query is required")
    .max(100, "Search query is too long")
    .trim(),
});

export const loader: LoaderFunction = async ({ context }) => {
  const myEnv = context.cloudflare.env as Env;
  const { session } = context;

  // Check if the user is authenticated using a session check
  const isAuthenticated = await checkAuthentication({ session });
  const userService = new UserService(myEnv);

  // Handle unauthenticated user attempting to access the protected resource
  if (isAuthenticated === false) {
    session.unset("auth");
    ApiService.clearToken();
    return redirect("/login");
  }

  try {
    const data = await userService.getAllData();

    // 3. If the token is invalid (403 Forbidden), attempt to refresh it or redirect to login
    if (!data.id) {
      console.log("Token is invalid or expired, attempting to refresh.");

      // Attempt to refresh the token
      const refreshResult = await userService.refreshUser(
        myEnv,
        isAuthenticated.id
      );

      console.log("refreshResult",refreshResult);

      if (refreshResult.success === false || !refreshResult) { 
        // If token refresh failed, unset the session and redirect to login
        session.unset("auth");
        ApiService.clearToken();
        return json({});
      }
    }

    // // If no data, assume the user is not authenticated
    // if (!data.id) {
    //   session.unset("auth");
    //   ApiService.clearToken();

    //   return redirect("/login");
    // }

    // console.log({ isAuthenticated, data });

    return json({});
  } catch (error) {
    // Log error if necessary
    console.error("Error fetching user data:", error);

    // If there's an error, unset the auth session and redirect to login
    session.unset("auth");
    return json({});
  }
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
    data: any;
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
          {/* <SearchBar fetcher={fetcher} /> */}

          {/* SearchResult component */}
          {fetcher.data && (
            <SearchResult
              message={fetcher.data.message}
              errors={fetcher.data.errors}
            />
          )}

          {/* Buttons */}
          <div className="mt-6 space-y-4">
            <ActionButton
                fetcher={fetcher}
                text="I'm hungry"
                route={"/api/clinicals"}
                action={"consider"} queryKey={""}            />
            <ActionButton
                fetcher={fetcher}
                text="What diet is best for me?"
                route={"/api/food/suggestions"}
                action={"diets"} queryKey={""}            />
            <ActionButton
                fetcher={fetcher}
                text="Recommended diet for ${Random}"
                route={"/api/food/suggestions"}
                action={"diets-recommended"} queryKey={""}            />
          </div>
        </div>
      )}
    </div>
  );
}
