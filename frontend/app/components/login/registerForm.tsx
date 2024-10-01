// app/components/RegisterForm.tsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionData } from "@remix-run/react";

interface RegisterFormProps {
  actionUrl: string; // Allows reuse for different action URLs if needed
}

interface ActionData {
  error?: string;
}

// Define the Zod schema for form validation
const registerSchema = z.object({
  username: z.string().email({ message: "Invalid email address" }).trim(),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" })
    .trim(),
});

// Infer the type from the Zod schema
type RegisterSchema = z.infer<typeof registerSchema>;

const RegisterForm: React.FC<RegisterFormProps> = ({ actionUrl }) => {
  const actionData = useActionData<ActionData>();

  // Separate state for actionType since it doesn't need validation
  const [actionType] = useState("register");

  // Set up React Hook Form with Zod schema validation
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
  });

  // Handle form submission
  const onSubmit = async (data: RegisterSchema) => {
    const formData = new FormData();
    formData.append("username", data.username);
    formData.append("password", data.password);
    formData.append("actionType", actionType);

    // Use fetch to submit the form data to the action URL
    const response = await fetch(actionUrl, {
      method: "POST",
      body: formData,
    });

    if (response.redirected) {
      window.location.href = response.url;
    } else {
      console.log("Error during submission:", await response.json());
    }
  };

  return (
    <section className=" flex flex-col justify-center items-center">
      <h1 className="text-center text-4xl font-bold text-blue-600 mb-8">
        Register
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-lg w-full mx-auto p-8 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg shadow-lg"
      >
        {/* Hidden field to send actionType */}
        <input type="hidden" name="actionType" value={actionType} />

        {/* Email Field */}
        <div className="mb-6">
          <label
            htmlFor="username"
            className="block text-gray-300 text-lg font-medium mb-2"
          >
            Email
          </label>
          <input
            type="text"
            id="username"
            {...register("username")}
            name="username"
            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-gray-200 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your Email"
          />
          {errors.username && (
            <p className="text-red-500 text-sm italic mt-2">
              {errors.username.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="mb-6">
          <label
            htmlFor="password"
            className="block text-gray-300 text-lg font-medium mb-2"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            {...register("password")}
            name="password"
            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-gray-200 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your password"
          />
          {errors.password && (
            <p className="text-red-500 text-sm italic mt-2">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Error Message */}
        {actionData?.error && (
          <div className="text-red-500 text-sm italic mb-3">
            {actionData.error}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-between mt-6">
          <button
            className="w-full px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300 transition duration-200"
            type="submit"
          >
            Register
          </button>
        </div>
      </form>
    </section>
  );
};

export default RegisterForm;
