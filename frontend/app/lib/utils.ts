import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// tailwind-merge only knows Tailwind's default theme. Without these, a DESIGN.md
// type token such as `text-label-sm` reads as a text color and is dropped when a
// color like `text-ink` follows it. Keep in sync with @theme in app/tailwind.css.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display-lg",
            "display-md",
            "title-md",
            "heading-sm",
            "body-lg",
            "body-md",
            "body-sm",
            "label-md",
            "label-sm",
            "data-md",
            "data-caps",
          ],
        },
      ],
      "font-family": [{ font: ["display", "body", "data"] }],
      shadow: [{ shadow: ["overlay"] }],
    },
  },
});

// Merge Tailwind class lists, letting later classes override earlier ones.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
