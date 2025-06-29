"use client";

import { useEffect, useState } from "react";
import { LuPanelLeftClose, LuPanelLeftOpen } from "react-icons/lu";
import { cn } from "@/lib/utils";
import SidebarDosen from "../dosen/SidebarDosen";

export default function ClientWrapperDosen({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState<boolean | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored !== null) {
      setIsCollapsed(stored === "true");
    } else {
      setIsCollapsed(false); // default jika tidak ada di localStorage
    }
    setIsHydrated(true);
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar-collapsed", String(next));
      return next;
    });
  };

  if (!isHydrated || isCollapsed === null) {
    return null;
  }

  return (
    <div className="flex flex-1 overflow-hidden relative">
      <div
        className={cn(
          "absolute top-4 z-50 w-9 h-9 flex items-center justify-center rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950/20 cursor-pointer transition-[left] motion-safe:duration-300",
          isCollapsed ? "left-24" : "left-68"
        )}
        onClick={toggleSidebar}
        title={isCollapsed ? "Buka Sidebar" : "Tutup Sidebar"}
      >
        {isCollapsed ? (
          <LuPanelLeftOpen className="h-5 w-5 text-gray-600 dark:text-neutral-400" />
        ) : (
          <LuPanelLeftClose className="h-5 w-5 text-gray-600 dark:text-neutral-400" />
        )}
      </div>

      <SidebarDosen isCollapsed={isCollapsed} onToggle={toggleSidebar} />

      <main className="flex-1 overflow-y-auto h-full bg-white dark:bg-neutral-900">{children}</main>
    </div>
  );
}
