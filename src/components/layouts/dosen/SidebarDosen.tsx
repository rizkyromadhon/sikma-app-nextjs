"use client";

import SidebarLink from "./SidebarLinkDosen";
import { cn } from "@/lib/utils";
import {
  LuLayoutDashboard,
  LuUsers,
  LuUserRound,
  LuGraduationCap,
} from "react-icons/lu";
import CollapsibleSidebarLink from "./CollapsibleSidebarDosenLink";
import { FaRegCommentDots } from "react-icons/fa";
import { useTheme } from "next-themes";
import ThemeSwitcher from "@/components/features/SidebarThemeToggle";
import ThemeToggle from "@/components/features/ToggleTheme";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  {
    href: "/dosen/dashboard",
    label: "Dashboard",
    icon: LuLayoutDashboard,
  },
  {
    href: "/dosen/profile",
    label: "Profile",
    icon: LuUserRound,
  },
  {
    label: "Akademik",
    icon: LuGraduationCap,
    subLinks: [
      {
        href: "/dosen/jadwal-kuliah",
        label: "Jadwal Kuliah",
      },
      { href: "/dosen/presensi/kelola-presensi", label: "Kelola Presensi" },
      { href: "/dosen/presensi/pengajuan-izin", label: "Pengajuan Izin/Sakit" },
    ],
  },
  { href: "/dosen/pengumuman", label: "Pengumuman", icon: FaRegCommentDots },
];

export default function SidebarDosen({
  isCollapsed,
  onToggle,
}: {
  isCollapsed: boolean;
  onToggle: () => void;
}) {
  const { theme } = useTheme();
  return (
    <div className="relative flex">
      <aside
        className={cn(
          " h-[calc(100vh-64px)] bg-white dark:bg-neutral-900/50 border-r border-gray-200 dark:border-neutral-800 transition-[width] duration-300 ease-in-out overflow-hidden relative",
          isCollapsed ? "w-20 min-w-[5rem]" : "w-64"
        )}
      >
        {/* Sidebar content */}
        <nav className="h-[41.5rem] overflow-y-auto overflow-x-hidden px-4 py-4">
          <div className="space-y-2">
            {navLinks.map((link) =>
              link.subLinks ? (
                <CollapsibleSidebarLink
                  key={link.label}
                  label={link.label}
                  icon={link.icon}
                  isCollapsed={isCollapsed}
                  subLinks={link.subLinks}
                />
              ) : (
                <SidebarLink
                  key={link.href}
                  href={link.href!}
                  label={link.label}
                  icon={link.icon}
                  isCollapsed={isCollapsed}
                />
              )
            )}
          </div>
        </nav>
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              key="theme-switcher"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <ThemeSwitcher theme={theme} />
            </motion.div>
          ) : (
            <motion.div
              key="theme-toggle"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, rotate: -360 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.4, delay: 0.01 }}
              className="flex justify-center"
            >
              <ThemeToggle style="mx-auto" />
            </motion.div>
          )}
        </AnimatePresence>
      </aside>
    </div>
  );
}
