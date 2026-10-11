// shadcn/ui Sonner Toaster, without next-themes (the app has no theme provider yet).
// DESIGN.md › Toasts: ink background, surface text, 10px radius, 5s, pauses on hover/focus.
import * as React from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = (props: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      position="bottom-right"
      duration={5000}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "font-body text-body-sm",
          description: "text-body-sm",
        },
      }}
      style={
        {
          "--normal-bg": "var(--color-ink)",
          "--normal-text": "var(--color-surface)",
          "--normal-border": "var(--color-ink)",
          "--border-radius": "var(--rounded-md)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
