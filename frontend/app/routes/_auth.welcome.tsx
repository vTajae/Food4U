import {
  json,
  ActionFunction,
  redirect,
  LoaderFunction,
} from "@remix-run/cloudflare";
import { FormProvider } from "../components/form/context";
import Form from "../components/form/index";
import { ProfileService } from "../../api/services/profileService";
import {
  WelcomeFormData,
  welcomeFormDataSchema,
} from "../../api/schemas/welcome";
import { ApiService } from "../../api/services/baseService";
import { checkAuthentication } from "../context/session/checkAuthentication";
import UserService from "../../api/services/userService";

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

      console.log("refreshResult", refreshResult);

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

export const action: ActionFunction = async ({ request }) => {
  try {
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

    // Return success response
    return json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    return json(
      { success: false, message: "An unexpected error occurred." },
      { status: 500 }
    );
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
