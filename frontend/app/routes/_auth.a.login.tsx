// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React,{ useState } from "react";
import { useActionData } from "@remix-run/react";
import {
  json,
  redirect,
  ActionFunction,
  Session,
  LoaderFunction,
} from "@remix-run/cloudflare";

import {createSessionStorage} from "../context/session/session"
import { Credentials } from "../props/credentials";
import UserService from "../../api/services/userService"
import { Env } from "../context";


interface ActionData {
  error?: string;
}

export const loader: LoaderFunction = async ({ context }) => {
  if (context.session.has("auth")) {
    return redirect("/a/employees");
  }

  return json({ isLoading: false });
};

export const action: ActionFunction = async ({ request, context }) => {
  const myEnv = context.cloudflare.env as Env;

  const mySession = context.session as Session;

  const userService = new UserService(myEnv);

  const formData = await request.formData();
  const actionType = formData.get("actionType");

  if (actionType === "login") {
    const userData = {
      username: formData.get("username"),
      password: formData.get("password"),
    } as Credentials;

    const loginResult = await userService.loginUser(userData);

    // Inside your login action
    if (loginResult.success && loginResult.user) {


      mySession.set("auth", { ...loginResult.user });


      // Commit the session to get the Set-Cookie header value.
      const cookieHeader = await createSessionStorage(myEnv).commitSession(
        mySession
      );


      return redirect("/a/employees", {
        headers: { "Set-Cookie": cookieHeader },
      });
    } else {
      context.session.flash("error", "Invalid username or password.");
      return redirect("/a/login");
    }
  } else {
    return json({ error: "Invalid action type." });
  }
};

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(""); // Add role state if needed for registration
  const [actionType, setActionType] = useState("login"); // Toggle between login and register
  const actionData = useActionData<ActionData>();

  return (
    <section className="container-fluid">
      <h1 className="text-center text-3xl font-bold text-black mt-8">Login</h1>

      <form
        action="/a/login"
        method="post"
        className="max-w-lg mx-auto mt-4 p-8 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl shadow-xl"
      >
        <input type="hidden" name="actionType" value={actionType} />

        <div className="mb-6">
          <label
            htmlFor="username"
            className="block text-gray-300 text-lg font-medium mb-2"
          >
            Email
          </label>
          <input
            type="text"
            name="username"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full py-3 px-4 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-sm transition duration-150 ease-in-out placeholder-gray-400"
            placeholder="Enter your Email"
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="password"
            className="block text-gray-300 text-lg font-medium mb-2"
          >
            Password
          </label>
          <input
            type="password"
            name="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full py-3 px-4 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-sm transition duration-150 ease-in-out placeholder-gray-400"
            placeholder="Enter your password"
          />
        </div>

        {actionType === "register" && (
          <div className="mb-6">
            <label
              htmlFor="role"
              className="block text-gray-300 text-lg font-medium mb-2"
            >
              Role
            </label>
            <select
              name="role"
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full py-3 px-4 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-sm transition duration-150 ease-in-out"
            >
              <option value="">Select a role</option>
              <option value="2">User</option>
              <option value="1">Admin</option>
            </select>
          </div>
        )}

        {actionData?.error && (
          <div className="text-red-500 text-sm italic mb-3">
            {actionData.error}
          </div>
        )}

        <div className="flex items-center justify-between">
          <button
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-opacity-50 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110"
            type="submit"
            onClick={() => setActionType("login")}
          >
            Login
          </button>
        </div>
      </form>
    </section>
  );
};

export default Login;
