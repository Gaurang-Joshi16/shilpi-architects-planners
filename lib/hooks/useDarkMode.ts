"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "sap-theme";

/**
 * useDarkMode — localStorage-backed dark/light mode toggle
 *
 * Toggles `dark-mode` class on `document.body`.
 * Persists preference under localStorage key "sap-theme".
 */
export function useDarkMode() {
  const [isDark, setIsDark] = useState(false);

  // Restore preference on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "dark") {
      document.body.classList.add("dark-mode");
      setIsDark(true);
    }
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.body.classList.add("dark-mode");
      localStorage.setItem(STORAGE_KEY, "dark");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem(STORAGE_KEY, "light");
    }
  }

  return { isDark, toggle };
}
