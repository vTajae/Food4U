// app/components/RegisterForm.tsx
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
  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", password: "" },
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
      //console.log("Error during submission:", await response.json());
    }
  };

  return (
    <section className="flex flex-col items-center">
      <h1 className="mb-6 text-center font-display text-display-md text-ink">
        Register
      </h1>

      <Form {...form}>
        {/* method/action make a submit before hydration POST to the route action
            instead of a GET that would put the password in the URL. */}
        <form
          method="post"
          action={actionUrl}
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
          className="flex w-full flex-col gap-5 rounded-(--rounded-lg) border border-line bg-surface p-6"
        >
          {/* Hidden field to send actionType */}
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
                    autoComplete="new-password"
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
            Register
          </Button>
        </form>
      </Form>
    </section>
  );
};

export default RegisterForm;
