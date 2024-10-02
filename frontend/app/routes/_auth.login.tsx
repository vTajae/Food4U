import {
  ActionFunction,
  redirect,
  json,
  Session,
} from "@remix-run/cloudflare";
import { useState } from "react";
import { createSessionStorage } from "../context/session/session";
import UserService from "../../api/services/userService";
import RegisterForm from "../components/login/registerForm";
import LoginForm from "../components/login/loginForm";

// export const loader: LoaderFunction = async ({ request, context }) => {
//   const myEnv = context.cloudflare.env as Env;
//   const mySession = context.session as Session;
//   // //console.log(context.session.get("auth"), "auth");
//   // if (context.session.has("auth")) {
//   //   return redirect("/dashboard");
//   // }
//   return json({ isLoading: false });
// };

// Server-side action handler
export const action: ActionFunction = async ({ request, context }) => {
  const myEnv = context.cloudflare.env as Env;
  const mySession = context.session as Session;
  const userService = new UserService(myEnv);

  try {
    const formData = await request.formData();

    // Ensure formData is available
    if (!formData) {
      context.session.flash("error", "Form data is missing.");
      return json({ error: "Login failed. Form data is required." });
    }

    // Extract fields safely from formData
    const username = formData.get("username") as string | null;
    const password = formData.get("password") as string | null;
    const actionType = formData.get("actionType") as string | null;

    // Validate that required fields are present
    if (!username || !password || !actionType) {
      context.session.flash("error", "Missing required fields.");
      return json({ error: "Login failed. All fields are required." });
    }

    // Logging submission for debugging
    //console.log("Submitted data:", { username, password, actionType });

    if (actionType === "login") {
      const loginResult = await userService.loginUser(
        { username, password },
        myEnv
      );
      


      if (loginResult.success && loginResult.user) {

        mySession.set("auth", { 
          ...loginResult.user,


         });
        //console.log("Session data after login:", mySession.data);

     

        const cookieHeader = await createSessionStorage(myEnv).commitSession(
          mySession
        );


        return redirect("/dashboard", {
          headers: { "Set-Cookie": cookieHeader },
        });
      } else {
        context.session.flash("error", "Invalid username or password.");
        return json({ error: "Invalid username or password." });
      }
    } else if (actionType === "register") {
      const registerResult = await userService.registerUser({
        username,
        password,
      });

      if (registerResult.success) {
        mySession.set("welcome", { isComplete: false });
        //console.log("Session data after registration:", mySession.data);

        const cookieHeader = await createSessionStorage(myEnv).commitSession(
          mySession
        );

        return redirect("/login", {
          headers: { "Set-Cookie": cookieHeader },
        });
      } else {
        context.session.flash("error", "Registration failed. Try again.");
        return json({ error: "Registration failed. Try again." });
      }
    }

    // If actionType is invalid
    context.session.flash("error", "Invalid action type.");
    return json({ error: "Invalid action type." });

  } catch (error) {
    // Log the error for server-side troubleshooting
    console.error("Error processing request:", error);
    context.session.flash(
      "error",
      "An error occurred while processing your request."
    );
    return json({ error: "An unexpected error occurred. Please try again." });
  }
};


// The component that renders the Login or Register form
const Login = () => {
  const [isRegister, setIsRegister] = useState(false); // Toggle between login and register forms

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-lg ">
      <div className="flex justify-center mb-6">
        <button
          onClick={() => setIsRegister(false)}
          className={`px-6 py-3 font-semibold rounded-lg m-2 transition-colors duration-300 ${
            !isRegister
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          } focus:outline-none focus:ring-4 focus:ring-blue-300`}
        >
          Login
        </button>
        <button
          onClick={() => setIsRegister(true)}
          className={`px-6 py-3 font-semibold rounded-lg m-2 transition-colors duration-300 ${
            isRegister
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          } focus:outline-none focus:ring-4 focus:ring-blue-300`}
        >
          Register
        </button>
      </div>

      <div className="mt-6">
        {isRegister ? (
          <RegisterForm actionUrl="/login" />
        ) : (
          <LoginForm actionUrl="/login" />
        )}
      </div>
    </div>
  );
};

export default Login;
