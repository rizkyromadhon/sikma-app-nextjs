"use client";

import SidebarLink from "./SidebarLink";
import { cn } from "@/lib/utils";
import {
  LuPanelLeftOpen,
  LuPanelLeftClose,
  LuLayoutDashboard,
  LuUsers,
  LuClipboardList,
} from "react-icons/lu";
import CollapsibleSidebarLink from "./CollapsibleSidebarLink";
import { FaRegCommentDots } from "react-icons/fa";
import { useTheme } from "next-themes";
import ThemeSwitcher from "@/components/features/SidebarThemeToggle";
import ThemeToggle from "@/components/features/ToggleTheme";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: LuLayoutDashboard,
  },
  {
    label: "Manajemen Akademik",
    icon: LuUsers,
    subLinks: [
      { href: "/admin/manajemen-akademik/dosen", label: "Dosen" },
      { href: "/admin/manajemen-akademik/mahasiswa", label: "Mahasiswa" },
      { href: "/admin/manajemen-akademik/semester", label: "Semester" },
      { href: "/admin/manajemen-akademik/program-studi", label: "Program Studi" },
      { href: "/admin/manajemen-akademik/golongan", label: "Golongan" },
      { href: "/admin/manajemen-akademik/ruangan", label: "Ruangan" },
      { href: "/admin/manajemen-akademik/mata-kuliah", label: "Mata Kuliah" },
      { href: "/admin/manajemen-akademik/jadwal-kuliah", label: "Jadwal Kuliah" },
      { href: "/admin/manajemen-akademik/peserta-kuliah", label: "Peserta Kuliah" },
    ],
  },
  {
    label: "Manajemen Presensi",
    icon: LuClipboardList,
    subLinks: [
      { href: "/admin/manajemen-presensi/alat-presensi", label: "Alat Presensi" },
      { href: "/admin/manajemen-presensi/registrasi-rfid", label: "Registrasi RFID" },
      { href: "/admin/manajemen-presensi/rekapitulasi-kehadiran", label: "Rekapitulasi Kehadiran" },
    ],
  },
  { href: "/admin/laporan-mahasiswa", label: "Laporan Mahasiswa", icon: FaRegCommentDots },
];

export default function Sidebar({ isCollapsed, onToggle }: { isCollapsed: boolean; onToggle: () => void }) {
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
