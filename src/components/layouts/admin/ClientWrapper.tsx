"use client";

import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
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
    <div className="flex flex-1 overflow-hidden">
      <Sidebar isCollapsed={isCollapsed} onToggle={toggleSidebar} />
      <main className="flex-1 overflow-y-auto h-full">
        <div key={isCollapsed ? "collapsed" : "expanded"}>{children}</div>
      </main>
    </div>
  );
}
