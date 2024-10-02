import {
  json,
  ActionFunction,
  LoaderFunction,
  redirect,
  Session,
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
import { SearchResult } from "../components/search/results";

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

  const mySession = context.session as Session;

  // Handle unauthenticated user attempting to access the protected resource
  if (!isAuthenticated) {
    session.unset("auth");
    ApiService.clearToken();
    return redirect("/login");
  }

  try {

    if (
      mySession.has("welcome") &&
      mySession.get("welcome").isComplete === false
    ) {
      return redirect("/welcome");
    }

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
      data = (await ProfileService.getAllData()) as ProfileSchema;

      console.log(data, "DATUUUH")
      
      if (!data.id) {
        console.error("Failed to fetch data after token refresh.");
        session.unset("auth");
        ApiService.clearToken();
        mySession.set("welcome", { isComplete: false });
        return redirect("/welcome");
      }
    }

    // console.log({ isAuthenticated, data });
    mySession.unset("welcome");

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

    // console.log({action: action, query: query, formData: formData});

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

  const [showWelcome, setShowWelcome] = useState(true);


  useEffect(() => {
    // Set the welcome screen to fade out after 1 second
    const timer = setTimeout(() => setShowWelcome(false), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`grid 
        bg-gradient-to-b from-cyan-400 to-blue-700
        text-white min-h-screen w-full flex flex-col justify-center items-center
        transition-opacity duration-500 ease-in-out
      `}
    >
      {showWelcome ? (
        <div className="flex items-center justify-center h-full welcome-screen">
          <h1 className="text-6xl font-bold">Welcome</h1>
        </div>
      ) : (
        <div className="p-6 w-full max-w-6xl text-center dashboard-content grid grid-cols-1 gap-4">
          {/* Main Heading */}
          <div className="col-span-1">
            <div className="flex justify-center">
              <h1 className="text-5xl font-bold mb-4">
                Food
                <span className="text-lg mb-4 text-center align-top">❤️</span>4U
              </h1>
            </div>
            <p className="text-lg mb-4">Talk to me about food</p>
          </div>

          {/* Search Bar */}
          <div className="mb-8 col-span-1">
            <SearchBar fetcher={fetcher} queryKey={"general"} action={"meal"} />
          </div>

          {/* Loading or Display Results */}
          {fetcher.state === "submitting" || fetcher.state === "loading" ? (
            <div className="flex flex-col items-center justify-center col-span-1 mt-6 space-y-4">
              <div className="text-lg font-semibold">Loading results...</div>
              {/* Optionally you can use a spinner */}
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : (
            <>
              {/* Display Results */}
              {fetcher.data?.meal && (
                <div className="col-span-1">
                  <Display
                    data={(fetcher.data.meal || []).map((item, index) => ({
                      item,
                      index,
                    }))} // Pass fetched results
                    renderItem={renderResultItem} // Use renderItem function to display each result
                  />
                </div>
              )}

              {/* Display Errors or Messages */}
              {fetcher.data && (
                <div className="col-span-1">
                  <SearchResult
                    message={fetcher.data?.message}
                    errors={fetcher.data?.errors}
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-8 col-span-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            </>
          )}
        </div>
      )}
    </div>
  );
}
