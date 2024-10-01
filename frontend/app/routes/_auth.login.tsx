import {
  LoaderFunction,
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

export const loader: LoaderFunction = async () => {
  // console.log(context.session.get("auth"), "auth");
  // if (context.session.has("auth")) {
  //   return redirect("/dashboard");
  // }
  return json({ isLoading: false });
};

// Server-side action handler
export const action: ActionFunction = async ({ request, context }) => {
  const myEnv = context.cloudflare.env as Env;
  const mySession = context.session as Session;
  const userService = new UserService(myEnv);

  try {
    const formData = await request.formData();

    if (!formData) {
      context.session.flash("error", "Try using our client.");
      return json({ error: "Login failed. Try using our client." });
    }

    // Extract fields directly from form data
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const actionType = formData.get("actionType") as string;

    // Ensure logging works correctly
    console.log("Submitted data:", { username, password, actionType });

    if (actionType === "login") {
      const loginResult = await userService.loginUser(
        { username, password },
        myEnv
      );

      if (loginResult.success && loginResult.user) {
        mySession.set("auth", { ...loginResult.user });

        console.log(mySession.data);

        const cookieHeader = await createSessionStorage(myEnv).commitSession(
          mySession
        );

        return redirect("/dashboard", {
          headers: { "Set-Cookie": cookieHeader },
        });
      } else {
        context.session.flash("error", "Invalid username or password.");
        return json({});
      }
    } else if (actionType === "register") {
      const registerResult = await userService.registerUser({
        username,
        password,
      });

      if (registerResult.success) {
        mySession.set("welcome", { isComplete: false });

        const cookieHeader = await createSessionStorage(myEnv).commitSession(
          mySession
        );

        return redirect("/login", {
          headers: { "Set-Cookie": cookieHeader },
        });
      } else {
        context.session.flash("error", "Registration failed. Try Again.");
        return json({ error: "Registration failed. Try Again." });
      }
    }

    return json({ error: "Invalid action type." });

    // Continue with the rest of your logic here
  } catch (error) {
    context.session.flash(
      "error",
      "An error occurred while processing your request."
    );
    return json({ error: "Login failed due to an unexpected error." });
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
