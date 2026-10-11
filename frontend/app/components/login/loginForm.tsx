// app/components/LoginForm.tsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionData } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";

interface LoginFormProps {
  actionUrl: string; // Allows reuse for different action URLs if needed
  initialActionType?: string; // Default to "login"
}

interface ActionData {
  error?: string;
}

// Define the Zod schema for form validation
const loginSchema = z.object({
  username: z.string().email({ message: "Invalid email address" }).trim(),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }).trim(),
});

// Infer the type from the Zod schema
type LoginSchema = z.infer<typeof loginSchema>;

const LoginForm: React.FC<LoginFormProps> = ({ actionUrl, initialActionType = "login" }) => {
  const actionData = useActionData<ActionData>();

  // Separate state for actionType since it doesn't need validation
  const [actionType] = useState(initialActionType);

  // Set up React Hook Form with Zod schema validation
  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  // Handle form submission
  const onSubmit = async (data: LoginSchema) => {
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
      //console.log("Error during submission:", await response.json());
    }
  };

  return (
    <section className="flex flex-col items-center">
      <h1 className="mb-6 text-center font-display text-display-md text-ink">Login</h1>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
          className="flex w-full flex-col gap-5 rounded-(--rounded-lg) border border-line bg-surface p-6"
        >
          <input type="hidden" name="actionType" value={actionType} />

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    inputMode="email"
                    autoComplete="username"
                    placeholder="Enter your Email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Error Message */}
          {actionData?.error && (
            <p role="alert" className="text-body-sm text-avoid">
              {actionData.error}
            </p>
          )}

          <Button type="submit" className="w-full">
            Login
          </Button>
        </form>
      </Form>
    </section>
  );
};

export default LoginForm;
