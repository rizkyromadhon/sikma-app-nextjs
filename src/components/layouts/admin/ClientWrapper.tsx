"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex flex-1 overflow-hidden">
      <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed((prev) => !prev)} />
      <main className="flex-1 overflow-y-auto h-full">
        <div key={isCollapsed ? "collapsed" : "expanded"}>{children}</div>
      </main>
    </div>
  );
}
