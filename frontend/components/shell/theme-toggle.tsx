"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { DropdownMenuItem } from "~/components/ui/dropdown-menu";

type Theme = "system" | "light" | "dark";
const KEY = "food4u-theme";

function readStored(): Theme {
  try {
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

function apply(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") delete root.dataset.theme;
  else root.dataset.theme = theme;
  try {
    if (theme === "system") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, theme);
  } catch {
    /* storage may be unavailable; the choice just won't persist */
  }
}

// Three menu items for the account menu: follow system, light, dark.
export function ThemeMenuItems() {
  const [theme, setTheme] = useState<Theme>("system");
  useEffect(() => setTheme(readStored()), []);

  const choose = (t: Theme) => () => {
    apply(t);
    setTheme(t);
  };

  const items: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: "system", label: "Match device", icon: Monitor },
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
  ];

  return (
    <>
      {items.map(({ value, label, icon: Icon }) => (
        <DropdownMenuItem
          key={value}
          onSelect={choose(value)}
          aria-checked={theme === value}
          role="menuitemradio"
        >
          <Icon aria-hidden="true" />
          {label}
          {theme === value && <span className="sr-only">(selected)</span>}
        </DropdownMenuItem>
      ))}
    </>
  );
}
