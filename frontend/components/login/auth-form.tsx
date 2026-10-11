"use client";

import { startTransition, useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlert } from "lucide-react";
import { toast } from "sonner";
import { authenticate, type AuthState } from "~/app/(auth)/login/actions";
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

const schema = z.object({
  username: z.string().email({ message: "Enter a valid email address." }).trim(),
  password: z.string().min(6, { message: "Use at least 6 characters." }).trim(),
});
type Values = z.infer<typeof schema>;

const initial: AuthState = { status: "idle" };

// One component for both tabs. Client validation via react-hook-form + zod,
// submission via the server action (also works as a plain POST before hydration).
export function AuthForm({
  mode,
  onRegistered,
}: {
  mode: "login" | "register";
  onRegistered?: () => void;
}) {
  const [state, formAction, pending] = useActionState(authenticate, initial);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", password: "" },
  });

  useEffect(() => {
    if (state.status === "registered") {
      toast.success(state.message);
      form.reset();
      onRegistered?.();
    }
    // Only react when the action result changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const onValid = (values: Values) => {
    const fd = new FormData();
    fd.set("username", values.username);
    fd.set("password", values.password);
    fd.set("actionType", mode);
    startTransition(() => formAction(fd));
  };

  const isLogin = mode === "login";

  return (
    <Form {...form}>
      <form
        action={formAction}
        onSubmit={form.handleSubmit(onValid)}
        noValidate
        className="flex flex-col gap-5"
      >
        <input type="hidden" name="actionType" value={mode} />

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  inputMode="email"
                  autoComplete="username"
                  placeholder="you@example.com"
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
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  placeholder={isLogin ? "Your password" : "At least 6 characters"}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {state.status === "error" && (
          <p role="alert" className="flex items-start gap-1.5 text-body-sm text-avoid">
            <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <span>{state.message}</span>
          </p>
        )}

        <Button type="submit" className="w-full" disabled={pending} aria-busy={pending}>
          {pending ? (isLogin ? "Logging in…" : "Creating account…") : isLogin ? "Log in" : "Create account"}
        </Button>
      </form>
    </Form>
  );
}
