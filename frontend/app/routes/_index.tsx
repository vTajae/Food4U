import { LoaderFunction, redirect } from "@remix-run/cloudflare";
import { Outlet } from "@remix-run/react";
import { ApiService } from "../../api/services/baseService";
import { checkAuthentication } from "../context/session/checkAuthentication";

export const loader: LoaderFunction = async ({ context }) => {
  const { session } = context;

  // Check if the user is authenticated using a session check
  const isAuthenticated = await checkAuthentication({ session });

  // Handle unauthenticated user attempting to access the protected resource
  if (!isAuthenticated) {
    session.unset("auth");
    ApiService.clearToken();
    return redirect("/login");
  }
};

const A = () => {
  return (
    <div className="container-fluid min-h-screen">
      <Outlet />
    </div>
  );
};

export default A;
