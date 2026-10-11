// Class recipes for Button, kept free of "use client" so server components
// (links styled as buttons) can use buttonVariants() directly.
import { cva, type VariantProps } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md font-body text-label-md whitespace-nowrap no-underline transition-colors duration-150 ease-out outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:translate-y-px disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none motion-reduce:active:translate-y-0 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        // One primary action per region (DESIGN.md › Buttons).
        default: "bg-primary text-on-primary hover:bg-primary-hover",
        secondary:
          "border border-line-strong bg-surface text-primary hover:bg-primary-soft",
        tertiary: "bg-transparent text-primary underline-offset-4 hover:underline",
        destructive: "border border-avoid bg-surface text-avoid hover:bg-avoid-tint",
      },
      size: {
        default: "h-12 px-5",
        sm: "h-11 px-3",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
