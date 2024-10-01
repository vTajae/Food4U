import {
  json,
  ActionFunction,
  redirect,
  LoaderFunction,
  Session,
} from "@remix-run/cloudflare";
import { FormProvider } from "../components/form/context";
import Form from "../components/form/index";
import ProfileService from "../../api/services/profileService";
import {
  WelcomeFormData,
  welcomeFormDataSchema,
} from "../../api/schemas/welcome";
import { ApiService } from "../../api/services/baseService";
import { checkAuthentication } from "../context/session/checkAuthentication";
import UserService from "../../api/services/userService";
import { useActionData, useNavigate } from "@remix-run/react";
import { createSessionStorage } from "../context/session/session";

export const loader: LoaderFunction = async ({ context }) => {
  const myEnv = context.cloudflare.env as Env;
  const { session } = context;

  // Check if the user is authenticated using a session check
  const isAuthenticated = await checkAuthentication({ session });
  const userService = new UserService(myEnv);
  const mySession = context.session as Session;


  // Handle unauthenticated user attempting to access the protected resource
  if (isAuthenticated === false) {
    session.unset("auth");
    ApiService.clearToken();
    return redirect("/login");
  }


  if (mySession.get("welcome").isComplete === true) {
    return redirect("/dashboard");
  }

  try {
    const data = await ProfileService.getAllData();

    // 3. If the token is invalid (403 Forbidden), attempt to refresh it or redirect to login
    if (!data) {
      console.log("Token is invalid or expired, attempting to refresh.");

      // Attempt to refresh the token
      const refreshResult = await userService.refreshUser(
        myEnv,
        isAuthenticated.id
      );

      console.log("refreshResult", refreshResult);

      if (refreshResult.success === false || !refreshResult) {
        // If token refresh failed, unset the session and redirect to login
        session.unset("auth");
        ApiService.clearToken();
        return json({});
      }
    }

    return json({});
  } catch (error) {
    // Log error if necessary
    console.error("Error fetching user data:", error);

    // If there's an error, unset the auth session and redirect to login
    session.unset("auth");
    return json({});
  }
};

export const action: ActionFunction = async ({ context, request }) => {
  try {
    const myEnv = context.cloudflare.env as Env;
    const formData = await request.formData();
    const preparedFormDataString = formData.get("submission");

    if (!preparedFormDataString || typeof preparedFormDataString !== "string") {
      return json(
        { success: false, message: "Invalid form data" },
        { status: 400 }
      );
    }

    const parsedData = JSON.parse(preparedFormDataString) as WelcomeFormData;

    // Validate the form data using Zod
    const result = welcomeFormDataSchema.safeParse(parsedData);

    console.log("Parsed data:", parsedData);

    if (!result.success) {
      console.log(result.error.errors);
      return json(
        {
          success: false,
          message: "Invalid form data",
          errors: result.error.flatten(),
        },
        { status: 400 }
      );
    }

    const validFormData: WelcomeFormData = result.data;

    console.log("Valid form data:", validFormData);
    // Send the data to the ProfileService
    const response = await ProfileService.createWelcomeProfile(validFormData);

    if (!response) {
      return json(
        {
          success: false,
          message: "An error occurred while submitting the profile.",
        },
        { status: 500 }
      );
    }

    const mySession = context.session as Session;

    mySession.set("welcome", { isComplete: true });
    await createSessionStorage(myEnv).commitSession(
      mySession
    );

    // Return success response
    return redirect("/dashboard");
  } catch (error) {
    console.error("Error:", error);
    return json(
      { success: false, message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
};

interface ActionData {
  status: string;
  message: string;
}

export default function Dashboard() {
  const navgation = useNavigate();
  const actionData = useActionData<ActionData>();

  if (actionData?.status === "success") {
    navgation("/dashboard");
  }

  return (
    <div className="p-6 bg-gray-50 h-screen">
      <h1 className="text-3xl font-bold text-blue-600 mb-8 text-center">
        Let&apos;s get started.
      </h1>
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg">
        <FormProvider>
          <Form />
        </FormProvider>
      </div>
    </div>
  );
}
