"use client";

// import { useState } from "react";
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
  // const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="relative flex">
      <aside
        className={cn(
          "hidden md:flex flex-col h-screen bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 transition-[width] duration-300 ease-in-out overflow-hidden relative",
          isCollapsed ? "w-20 min-w-[5rem]" : "w-64"
        )}
      >
        {/* Sidebar content */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4">
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
      </aside>

      <div
        className="absolute top-6/14 -right-4 transform -translate-y-1/2 bg-white dark:bg-black shadow border border-slate-300 dark:border-slate-700 z-10 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer"
        onClick={onToggle}
      >
        {isCollapsed ? (
          <LuPanelLeftOpen className="h-6 w-6 text-gray-600 dark:text-gray-400" />
        ) : (
          <LuPanelLeftClose className="h-6 w-6 text-gray-600 dark:text-gray-400" />
        )}
      </div>
    </div>
  );
}
