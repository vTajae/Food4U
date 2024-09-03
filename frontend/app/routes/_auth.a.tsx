// import { LoaderFunction, json, redirect } from "@remix-run/cloudflare";
// import { Outlet } from "@remix-run/react";
// // eslint-disable-next-line @typescript-eslint/no-unused-vars
// import React from "react";

// export const loader: LoaderFunction = async ({ request, context }) => {
//   const url = new URL(request.url);

//   if (url.pathname === "/a/login" || url.pathname === "/a/login/" || url.pathname === "/a/register" || url.pathname === "/a/register/") {
//     return json({});
//   }

//   // if (!context.session.has("auth")) {
//   //   return redirect("/");
//   // }

//   // Only redirect if the path is exactly '/a/' (considering the trailing slash)
//   if (url.pathname === "/a/" || url.pathname === "/a/index") {
//     return redirect("/");
//   }
//   // No redirection for other paths like '/a/employee'
//   return null;
// };

// const A = () => {
//   return (
//     <div className="container-fluid min-h-screen">
//       <Outlet />
//     </div>
//   );
// };

// export default A;
