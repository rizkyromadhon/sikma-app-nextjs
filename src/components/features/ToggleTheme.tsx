"use client";

import { useTheme } from "next-themes"; // PASTIKAN DARI next-themes
import { useEffect, useState } from "react";
import { LuSun, LuMoon } from "react-icons/lu";

export default function ThemeToggle({ style }: { style?: string }) {
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
      className={`flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-neutral-950 text-gray-700 dark:text-gray-300 cursor-pointer ${style}`}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <LuSun className="h-5 w-5 hover:transform hover:rotate-90" />
      ) : (
        <LuMoon className="h-5 w-5" />
      )}
    </button>
  );
}
