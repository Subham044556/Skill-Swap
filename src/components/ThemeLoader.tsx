"use client";

import { useEffect } from "react";

export default function ThemeLoader() {
  useEffect(() => {
    async function loadTheme() {
      try {
        const res = await fetch("/api/preferences");

        if (!res.ok) return;

        const data = await res.json();

        document.documentElement.classList.remove("light", "dark");

        if (data.theme === "dark") {
          document.documentElement.classList.add("dark");
        } else if (data.theme === "light") {
          document.documentElement.classList.add("light");
        }
      } catch (err) {
        console.error(err);
      }
    }

    loadTheme();
  }, []);

  return null;
}