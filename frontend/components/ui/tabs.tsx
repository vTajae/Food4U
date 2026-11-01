"use client";

// shadcn/ui Tabs (new-york-v4), restyled with DESIGN.md tokens: a rice track with
// the active tab on a white plate in aubergine. Radix handles arrow-key navigation.
import * as React from "react";
import { Tabs as TabsPrimitive } from "radix-ui";

import { cn } from "~/lib/utils";

const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Root
    ref={ref}
    data-slot="tabs"
    className={cn("flex flex-col gap-6", className)}
    {...props}
  />
));
Tabs.displayName = "Tabs";

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    data-slot="tabs-list"
    className={cn(
      "inline-flex w-full items-center gap-1 rounded-(--rounded-md) border border-line bg-background p-1",
      className
    )}
    {...props}
  />
));
TabsList.displayName = "TabsList";

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    data-slot="tabs-trigger"
    className={cn(
      "inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-[calc(var(--rounded-md)-4px)] px-4 font-body text-label-md text-ink-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:pointer-events-none disabled:opacity-40 data-[state=active]:bg-surface data-[state=active]:text-primary data-[state=active]:shadow-[0_1px_2px_rgb(35_32_42/0.08)]",
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = "TabsTrigger";

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    data-slot="tabs-content"
    className={cn(
      "flex-1 rounded-(--rounded-lg) outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
