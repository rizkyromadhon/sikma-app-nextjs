"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const themes = ["light", "dark", "system"] as const;

export default function FooterThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTheme, setActiveTheme] = useState("system");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (theme) setActiveTheme(theme);
  }, [theme]);

  if (!mounted) return null;

  const handleToggle = (newTheme: string) => {
    setTheme(newTheme);
    setActiveTheme(newTheme);
  };

  const index = themes.indexOf(activeTheme as (typeof themes)[number]);

  return (
    <div className="relative flex w-30 md:w-22 h-10 md:h-9 items-center justify-between rounded-full border px-1 dark:bg-neutral-950 bg-neutral-200/60">
      <motion.div
        layout
        transition={{
          type: "spring",
          visualDuration: 0.2,
          bounce: 0.3,
          stiffness: 350,
          damping: 30,
          duration: 0.1,
        }}
        className="absolute md:top-1 h-9 w-9 md:w-7 md:h-7 rounded-full bg-white dark:bg-neutral-800 shadow "
        style={{
          left: `${index * (isMobile ? 39 : 26) + (isMobile ? 2 : 3)}px`,
        }}
      />

      <button
        onClick={() => handleToggle("light")}
        className="relative z-10 w-8 h-8 flex items-center justify-center text-neutral-500 dark:text-neutral-400"
      >
        <Sun className="w-4 h-4" />
      </button>
      <button
        onClick={() => handleToggle("dark")}
        className="relative z-10 w-8 h-8 flex items-center justify-center text-neutral-500 dark:text-neutral-400"
      >
        <Moon className="w-4 h-4" />
      </button>
      <button
        onClick={() => handleToggle("system")}
        className="relative z-10 w-8 h-8 flex items-center justify-center text-neutral-600 dark:text-neutral-300"
      >
        <Monitor className="w-4 h-4" />
      </button>
    </div>
  );
}
