import { json, ActionFunction } from "@remix-run/cloudflare";
import { FormProvider } from "../components/form/context";
import Form from "../components/form/index";
import { ProfileService } from "../../api/services/profileService";
import {
  WelcomeFormData,
  welcomeFormDataSchema,
} from "../../api/schemas/welcome";

export const action: ActionFunction = async ({ request }) => {
  try {
    const formData = await request.formData();
    const preparedFormDataString = formData.get("preparedFormData");

    if (!preparedFormDataString || typeof preparedFormDataString !== "string") {
      return json(
        { success: false, message: "Invalid form data" },
        { status: 400 }
      );
    }

    const preparedFormData = JSON.parse(preparedFormDataString);

    console.log(preparedFormData);

    // Validate the form data using Zod
    const result = welcomeFormDataSchema.safeParse(preparedFormDataString);

    if (!result.success) {
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
