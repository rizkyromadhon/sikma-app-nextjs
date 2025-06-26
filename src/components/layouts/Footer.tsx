"use client";

import { Github, Heart } from "lucide-react";
import Link from "next/link";
import FooterThemeToggle from "../features/FooterThemeToggle";

export default function Footer() {
  return (
    <>
      <footer className="w-full hidden md:block border-t dark:border-neutral-800 py-6 px-4 md:px-8 text-center text-sm text-muted-foreground bg-white dark:bg-neutral-900/50">
        <div className="flex flex-col md:flex-row justify-between items-center gap-2 max-w-6xl mx-auto">
          <p className="flex items-center gap-1 text-xs">&copy; Sistem Kehadiran Mahasiswa 2025.</p>

          <div className="flex items-center gap-4">
            <FooterThemeToggle />
          </div>
        </div>
      </footer>
      <footer className="w-full block md:hidden border-t dark:border-neutral-800 py-12 px-4 md:px-8 text-center text-sm text-muted-foreground bg-white dark:bg-neutral-900/50">
        <div className="flex flex-col justify-between items-center gap-4 max-w-6xl mx-auto">
          <p className="flex items-center gap-1">&copy; Sistem Kehadiran Mahasiswa 2025.</p>

          <div className="flex items-center gap-4">
            <FooterThemeToggle />
          </div>
        </div>
      </footer>
    </>
  );
}
