"use client";

import { useEffect, useState } from "react";
import { AuthForm } from "~/components/login/auth-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { wakeBackend } from "~/lib/wake-backend";

// Login / Register as Radix Tabs (arrow keys switch; only the active form is mounted).
export function AuthTabs({ initialTab = "login" }: { initialTab?: "login" | "register" }) {
  const [tab, setTab] = useState<"login" | "register">(initialTab);

  useEffect(() => { void wakeBackend(); }, []);

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v === "register" ? "register" : "login")}>
      <TabsList aria-label="Log in or create an account">
        <TabsTrigger value="login">Log in</TabsTrigger>
        <TabsTrigger value="register">Create account</TabsTrigger>
      </TabsList>

      <TabsContent value="login">
        <h2 className="mb-5 font-display text-display-md text-ink">Welcome back</h2>
        <AuthForm mode="login" />
      </TabsContent>
      <TabsContent value="register">
        <h2 className="mb-5 font-display text-display-md text-ink">Create your account</h2>
        <AuthForm mode="register" onRegistered={() => setTab("login")} />
      </TabsContent>
    </Tabs>
  );
}
