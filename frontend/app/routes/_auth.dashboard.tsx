import {
  json,
  ActionFunction,
  LoaderFunction,
  redirect,
} from "@remix-run/cloudflare";
import { z } from "zod";
import { useFetcher } from "@remix-run/react";
import { useState, useEffect } from "react";
import UserService from "../../api/services/userService";
import { checkAuthentication } from "../context/session/checkAuthentication";
import { ActionButton, SearchBar } from "../components/search/bar";
import { ApiService } from "../../api/services/baseService";
import { FetcherDataType } from "../../api/schemas/refs";
// import { SearchResult } from "../components/search/results";
import ProfileService from "../../api/services/profileService";
import { ProfileSchema } from "../../api/schemas/profile";
import Display, { renderResultItem } from "../components/search/display";
import { SearchResult } from "~/components/search/results";

export const searchSchema = z.object({
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
  if (!isAuthenticated) {
    session.unset("auth");
    ApiService.clearToken();
    return redirect("/login");
  }

  try {
    let data = (await ProfileService.getAllData()) as ProfileSchema;

    // If no data, token might be invalid/expired; try refreshing
    if (!data.id) {
      console.log("Token is invalid or expired, attempting to refresh.");

      const refreshResult = await userService.refreshUser(
        myEnv,
        isAuthenticated.id
      );

      if (!refreshResult || refreshResult.success === false) {
        console.error("Token refresh failed.");
        session.unset("auth");
        ApiService.clearToken();
        return redirect("/login");
      }

      // Retry fetching the profile after a successful token refresh
      data = await ProfileService.getAllData() as ProfileSchema;
      if (!data.id) {
        console.error("Failed to fetch data after token refresh.");
        session.unset("auth");
        ApiService.clearToken();
        return redirect("/welcome");
      }
    }

    console.log({ isAuthenticated, data });

    // Pass the profile data to the component via loader
    return json({ profile: data });
  } catch (error) {
    console.error("Error fetching user data:", error);
    session.unset("auth");
    ApiService.clearToken();
    return redirect("/login");
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
  }
};

export default function Dashboard() {
  const fetcher = useFetcher<FetcherDataType>();
  const [fetching, setFetching] = useState(false);


  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    // Set the welcome screen to fade out after 1 second
    const timer = setTimeout(() => setShowWelcome(false), 300);
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
        <div className="flex items-center justify-center h-full welcome-screen">
          <h1 className="text-6xl font-bold">Welcome</h1>
        </div>
      ) : (
        <div className="p-6 text-center dashboard-content">
          <h1 className="text-5xl font-bold mb-6">Food4U</h1>
          <p className="text-lg mb-4">Talk to me about food</p>

          <SearchBar
            fetcher={fetcher}
            queryKey={"general"}
            action={"meal"}

          />

          {fetcher.data?.results && (
            <Display
              data={fetcher.data.results || []} // Pass fetched results
              renderItem={renderResultItem} // Use renderItem function to display each result
            />
          )}

     {fetcher.data && (
            <SearchResult
              message={fetcher.data?.message}
              errors={fetcher.data?.errors}
              fetching={fetching} // Pass fetching state to the result component
            />
          )}


          {/* Buttons */}
          <div className="mt-6 space-y-4">
            <ActionButton
              fetcher={fetcher}
              text="I'm hungry"
              route={"/api/suggestion"}
              action={"suggest"}
              queryKey={"randomMeal"}
            />
            <ActionButton
              fetcher={fetcher}
              text="Let's Cook Something!"
              route={"/api/suggestion"}
              action={"recipie"}
              queryKey={"newRecipie"}
            />
            <ActionButton
              fetcher={fetcher}
              text="What diets support my eating habits?"
              route={"/api/suggestion"}
              action={"diet"}
              queryKey={"dietSuggest"}
            />
          </div>
        </div>
      )}
    </div>
  );
}
