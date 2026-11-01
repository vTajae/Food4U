"use client";

// shadcn/ui Command (new-york-v4) on cmdk, restyled with DESIGN.md tokens.
// CommandDialog is omitted (not used). Items are 44px tall for touch.
import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { SearchIcon } from "lucide-react";

import { cn } from "~/lib/utils";

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    data-slot="command"
    className={cn(
      "flex h-full w-full flex-col overflow-hidden rounded-(--rounded-md) bg-surface font-body text-ink",
      className
    )}
    {...props}
  />
));
Command.displayName = "Command";

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div
    data-slot="command-input-wrapper"
    className="flex h-12 items-center gap-2 border-b border-line px-3"
  >
    <SearchIcon aria-hidden="true" className="size-5 shrink-0 text-ink-muted" />
    <CommandPrimitive.Input
      ref={ref}
      data-slot="command-input"
      className={cn(
        "flex h-12 w-full bg-transparent text-body-md text-ink outline-hidden placeholder:text-ink-muted disabled:cursor-not-allowed disabled:opacity-40",
        className
      )}
      {...props}
    />
  </div>
));
CommandInput.displayName = "CommandInput";

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    data-slot="command-list"
    className={cn(
      "max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto",
      className
    )}
    {...props}
  />
));
CommandList.displayName = "CommandList";

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    data-slot="command-empty"
    className={cn("px-3 py-6 text-center text-body-sm text-ink-muted", className)}
    {...props}
  />
));
CommandEmpty.displayName = "CommandEmpty";

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    data-slot="command-group"
    className={cn(
      "overflow-hidden p-1 text-ink [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:font-data [&_[cmdk-group-heading]]:text-data-caps [&_[cmdk-group-heading]]:text-ink-muted [&_[cmdk-group-heading]]:uppercase",
      className
    )}
    {...props}
  />
));
CommandGroup.displayName = "CommandGroup";

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    data-slot="command-item"
    className={cn(
      "relative flex min-h-11 cursor-pointer items-center gap-2 rounded-(--rounded-sm) px-2 py-2 text-body-md outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-40 data-[selected=true]:bg-primary-soft data-[selected=true]:text-primary [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
      className
    )}
    {...props}
  />
));
CommandItem.displayName = "CommandItem";

export {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
};
