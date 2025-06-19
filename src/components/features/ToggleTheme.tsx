"use client";

import { useTheme } from "next-themes"; // PASTIKAN DARI next-themes
import { useEffect, useState } from "react";
import { LuSun, LuMoon } from "react-icons/lu";

export default function ThemeToggle() {
  // Ubah jadi default export kalau belum
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-9" />;
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <LuSun className="h-5 w-5 text-yellow-400" /> : <LuMoon className="h-5 w-5" />}
    </button>
  );
}
