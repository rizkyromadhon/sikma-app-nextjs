import Link from "next/link";
import { usePathname } from "next/navigation";
import { type IconType } from "react-icons";
import { cn } from "@/lib/utils";

interface SidebarLinkDosenProps {
  href: string;
  label: string;
  icon: IconType;
  isCollapsed: boolean;
}

export default function SidebarLinkDosen({ href, label, icon: Icon, isCollapsed }: SidebarLinkDosenProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "grid grid-cols-[24px_1fr] items-center rounded-lg hover:transition-all text-sm w-full",
        isCollapsed ? "px-[13px] py-2" : "px-[13px] py-2",
        "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200",
        isActive && "bg-gray-100 dark:bg-[#141414] text-black dark:text-white font-medium"
      )}
    >
      <div className="w-6 flex-shrink-0 text-center">
        <Icon className="h-5 w-5" />
      </div>

      <div
        className={cn(
          "overflow-hidden whitespace-nowrap hover:transition-all ",
          isCollapsed ? "opacity-0 w-0 ml-0" : "opacity-100 w-auto ml-2"
        )}
      >
        {label}
      </div>
    </Link>
  );
}
