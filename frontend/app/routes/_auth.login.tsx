import {
  LoaderFunction,
  ActionFunction,
  redirect,
  json,
  Session,
} from "@remix-run/cloudflare";
import { useState } from "react";
import LoginForm from "../components/login/loginForm";
import RegisterForm from "../components/login/registerForm";
import { createSessionStorage } from "../context/session/session";
import UserService from "../../api/services/userService";


export const loader: LoaderFunction = async ({ context }) => {
  if (context.session.has("auth")) {
    return redirect("/dashboard");
  }
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
      const loginResult = await userService.loginUser({ username, password }, myEnv);

      if (loginResult.success && loginResult.user) {
        mySession.set("auth", { ...loginResult.user });
        const cookieHeader = await createSessionStorage(myEnv).commitSession(
          mySession
        );
        return redirect("/dashboard", {
          headers: { "Set-Cookie": cookieHeader },
        });
      } else {
        context.session.flash("error", "Invalid username or password.");
        return redirect("/login");
      }
    } else if (actionType === "register") {
      const registerResult = await userService.registerUser({
        username,
        password,
      });

      if (registerResult.success) {
        return redirect("/login");
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
    <div>
      <div className="text-center">
        <button
          onClick={() => setIsRegister(false)}
          className={`px-4 py-2 ${
            !isRegister ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
          } rounded-lg m-2`}
        >
          Login
        </button>
        <button
          onClick={() => setIsRegister(true)}
          className={`px-4 py-2 ${
            isRegister ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
          } rounded-lg m-2`}
        >
          Register
        </button>
      </div>

      {isRegister ? (
        <RegisterForm actionUrl="/login" />
      ) : (
        <LoginForm actionUrl="/login" />
      )}
    </div>
  );
};

export default Login;
