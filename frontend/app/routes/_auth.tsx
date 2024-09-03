// import {
//   LoaderFunction,
//   Session,
//   type MetaFunction,
//   json,
// } from "@remix-run/cloudflare";
// import { Link, Outlet, useLoaderData } from "@remix-run/react";
// // eslint-disable-next-line @typescript-eslint/no-unused-vars
// import React, { useEffect } from "react";

// import { UserModel } from "../../api/models/user";
// import { checkAuthentication } from "../../app/context/session/checkAuthentication";

// export interface UserToken {
//   access_token: string | null;
// }

// export const meta: MetaFunction = () => {
//   return [{ title: "ICM" }, { name: "description", content: "" }];
// };

// type LoaderData = {
//   user: UserModel | null;
//   isLoading: boolean;
//   isLoggedIn: boolean;
// };

// // Assuming `next` function properly handles the request if the user isn't logged in
// export const loader: LoaderFunction = async ({ context }) => {
//   const mySesh = context.session as Session;

//   const user = await checkAuthentication({ session: mySesh });

//   if (user) {
//     // Return user data and indicate loading has finished
//     return json({ user, isLoading: false, isLoggedIn: true });
//   } else {
//     // No user data, still not loading
//     return json({ isLoading: false, isLoggedIn: false });
//   }
// };

// export default function Auth() {
//   const data = useLoaderData<LoaderData>();

//   // useEffect(() => {
//   //   // Update both user and loading state based on server response
//   //   if (data.user) {
//   //     console.log("Its working");
//   //     dispatch(setUser(data.user));
//   //   } else {
//   //     console.log("Its not working");
//   //     dispatch(setLogout());
//   //   }
//   //   // Set loading state based on loader data
//   //   dispatch(setLoading(data.isLoading));
//   // }, [data.user, data.isLoading]);

//   const username = data.user?.username.includes("@")
//     ? data.user.username.split("@")[0]
//     : data.user?.username;

//   // const handleCloseModals = () => {
//   //   dispatch(closeModal());
//   // };

//   const isModalOpen = true;

//   // Check if the path includes '/a/employee/' to conditionally render the Home button
//   return (
//     <div className="p-4 bg-white shadow-md rounded-lg">
//       {data && data.isLoggedIn && (
//         <div className="flex flex-col justify-between items-end">
//           <h1 className="mb-4 text-2xl font-bold text-gray-800">
//             Welcome Back, {username}
//           </h1>
//           <div className="flex space-x-4">
//             {!isModalOpen && (
//               <Link
//                 to="/a/employees/"
//                 className="inline-block px-4 py-2 text-white font-semibold bg-green-500 rounded hover:bg-green-600 transition-colors duration-150 ease-in-out"
//               >
//                 Home
//               </Link>
//             )}
//             {isModalOpen && (
//               <button
//                 // onClick={handleCloseModals}
//                 className="px-4 py-2 text-white font-semibold bg-red-500 rounded hover:bg-red-600 transition-colors duration-150 ease-in-out"
//               >
//                 Close
//               </button>
//             )}
//           </div>
//         </div>
//       )}
//       <Outlet />
//     </div>
//   );
// }
