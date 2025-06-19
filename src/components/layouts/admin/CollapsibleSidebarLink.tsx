"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type IconType } from "react-icons";
import { cn } from "@/lib/utils";
import { LuChevronDown } from "react-icons/lu";

interface SubLink {
  href: string;
  label: string;
}

interface CollapsibleSidebarLinkProps {
  label: string;
  icon: IconType;
  isCollapsed: boolean;
  subLinks: SubLink[];
}

export default function CollapsibleSidebarLink({
  label,
  icon: Icon,
  isCollapsed,
  subLinks,
}: CollapsibleSidebarLinkProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(subLinks.some((link) => pathname.startsWith(link.href)));

  const isParentActive = subLinks.some((link) => pathname.startsWith(link.href));

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "grid grid-cols-[24px_1fr] w-full items-center rounded-lg text-gray-600 dark:text-gray-400 hover:transition-all duration-300 hover:text-gray-900 dark:hover:text-gray-200 text-sm",
          isCollapsed ? "px-[13px] py-2" : "px-[13px] py-2",
          isParentActive && "text-black dark:text-white bg-gray-100 dark:bg-[#141414]"
        )}
      >
        <div className="w-6 flex-shrink-0 text-center">
          <Icon className="h-5 w-5" />
        </div>

        <div className="flex items-center justify-between flex-1 overflow-hidden">
          <div
            className={cn(
              "overflow-hidden flex items-start whitespace-nowrap hover:transition-all duration-300",
              isCollapsed ? "opacity-0 w-0 ml-0" : "opacity-100 w-auto ml-2"
            )}
          >
            {label}
          </div>

          {!isCollapsed && (
            <LuChevronDown
              className={cn("h-4 w-4 transition-transform duration-200", isOpen && "-rotate-180")}
            />
          )}
        </div>
      </button>

      {isOpen && !isCollapsed && (
        <div className="mt-2 space-y-1 pl-5">
          <div className="mt-2 space-y-1 ml-2 pl-3 border-l border-gray-200 dark:border-gray-700">
            {subLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "relative block rounded-md px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200",
                    isActive && "bg-gray-100 dark:bg-[#141414] text-black dark:text-white font-medium"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
