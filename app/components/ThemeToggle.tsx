"use client";

import { useEffect, useState } from "react";

type ThemePreference = "system" | "light" | "dark";

const STORAGE_KEY = "theme-preference";
const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

function applyTheme(pref: ThemePreference) {
  if (pref === "system") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", pref);
  }
}

export function ThemeToggle() {
  // "system" is a safe, deterministic first paint on both server and
  // client; the real saved preference (if any) is read and applied in an
  // effect, matching the inline script in layout.tsx that already avoided
  // a flash of the wrong theme before hydration.
  const [preference, setPreference] = useState<ThemePreference>("system");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "light" || saved === "dark" || saved === "system") {
        // Adopting client-only external state (localStorage) on mount; a lazy
        // useState initializer would also run during SSR and cause a
        // hydration mismatch, which is exactly what this effect avoids.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPreference(saved);
      }
    } catch {
      // localStorage unavailable — stay on "system".
    }
  }, []);

  function choose(pref: ThemePreference) {
    setPreference(pref);
    applyTheme(pref);
    try {
      window.localStorage.setItem(STORAGE_KEY, pref);
    } catch {
      // Unavailable (private browsing, quota) — the choice just won't persist.
    }
  }

  return (
    <div role="group" aria-label="Color theme" className="flex rounded-md border border-foreground/20 p-0.5">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          aria-pressed={preference === opt.value}
          onClick={() => choose(opt.value)}
          className={`min-h-11 min-w-11 rounded px-2 text-xs font-medium outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:min-w-0 sm:px-3 ${
            preference === opt.value
              ? "bg-accent text-accent-foreground"
              : "text-foreground/65 hover:bg-foreground/[0.06] hover:text-foreground"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
