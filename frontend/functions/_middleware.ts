// import { Session, redirect } from "@remix-run/cloudflare";
// import { checkAuthentication } from "../app/context/session/checkAuthentication";

// interface RequestContext {
//   request: Request;
//   next: (request: Request) => Promise<Response>;
//   session: Session;
// }

// export async function onRequest(context: RequestContext) {
//   const { request, next, session } = context;

//   const url = new URL(request.url);
//   const isAuthenticated = await checkAuthentication({ session });

//   // Define protected route prefix and specific public routes
//   const protectedRoutePrefix = "/";  // Correct prefix based on your structure
//   const publicRoutes = ["/login"];

//   // Redirect authenticated users away from login/register to the dashboard
//   if (publicRoutes.includes(url.pathname) && isAuthenticated) {
//     return redirect("/dashboard");
//   }

//   // Protect all routes starting with '/_auth' and redirect unauthenticated users to '/'
//   if (url.pathname.startsWith(protectedRoutePrefix) && !isAuthenticated && !url.pathname.startsWith("/login")) {
//     return redirect("/login");  // Redirect to login instead of "/"
//   }

//   // Allow the request to proceed for all other cases
//   return next(request);
// }
