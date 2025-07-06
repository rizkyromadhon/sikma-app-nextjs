"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Session } from "next-auth";
import DropdownDesktop from "./DropdownDesktop";
import DropdownMobile from "./DropdownMobile";
import { signOut } from "next-auth/react";
import LogoutModal from "../common/LogoutModal";
import ThemeToggle from "../features/ToggleTheme";
import NotificationBell from "../features/NotificationBell";

interface NavbarClientProps {
  session: Session | null;
}

export default function NavbarClient({ session }: NavbarClientProps) {
  const pathname = usePathname();
  const [, setIsScrolled] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const highlightRef = useRef<HTMLDivElement>(null);
  const navContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    const target = e.currentTarget;
    const highlight = highlightRef.current;
    const container = navContainerRef.current;

    if (highlight && container) {
      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();

      highlight.style.left = `${targetRect.left - containerRect.left}px`;
      highlight.style.top = `${targetRect.top - containerRect.top}px`;
      highlight.style.width = `${targetRect.width}px`;
      highlight.style.height = `${targetRect.height}px`;
      highlight.style.opacity = "1";
    }
  };

  const handleMouseLeave = () => {
    if (highlightRef.current) {
      highlightRef.current.style.opacity = "0";
    }
  };

  const handleLogout = () => {
    signOut({ callbackUrl: "/login?logout=success" });
  };

  const navLinks =
    session?.user && (session.user.role === "ADMIN" || session.user.role === "DOSEN")
      ? [
          { href: "/", label: "Home" },
          { href: "/pusat-bantuan", label: "Pusat Bantuan" },
        ]
      : [
          { href: "/", label: "Home" },
          { href: "/jadwal-kuliah", label: "Jadwal Kuliah" },
          { href: "/presensi-kuliah", label: "Presensi Kuliah" },
          { href: "/pusat-bantuan", label: "Pusat Bantuan" },
        ];

  return (
    <>
      <nav
        className={`sticky top-0 z-50 border-b border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 backdrop-blur-md`}
      >
        <div className="mx-auto max-w-12/13 ">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-16">
              <Link href="/" className="text-2xl font-bold tracking-tight text-black dark:text-white">
                &apos;SIKMA&apos;
              </Link>

              <div
                ref={navContainerRef}
                className="relative hidden md:flex items-center space-x-4"
                onMouseLeave={handleMouseLeave}
              >
                <div
                  ref={highlightRef}
                  className="absolute bg-slate-100 dark:bg-[#1f1f1f] rounded-full transition-all duration-200 ease-out -z-10 opacity-0"
                />

                {navLinks.map(({ href, label }) => {
                  const isActive = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      onMouseEnter={handleMouseEnter}
                      className={`relative text-sm font-medium transition-colors ease-out duration-200 px-3 py-1.5 rounded-full ${
                        isActive
                          ? "text-black dark:text-[#e2e2e2]"
                          : "text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-[#c9c9c9]"
                      }`}
                    >
                      {label}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="z-10 flex items-center">
              {/* Desktop */}
              <div className="hidden md:block ml-4">
                {session?.user ? (
                  <div className="hidden md:flex items-center gap-2 ml-4">
                    {!(session.user.role === "ADMIN" || session.user.role === "DOSEN") && (
                      <NotificationBell userId={session.user.id!} />
                    )}
                    <DropdownDesktop session={session} onLogoutClick={() => setIsLogoutModalOpen(true)} />
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200 border-1 rounded-md px-4 py-2 border-slate-300 dark:border-neutral-800 hover:bg-slate-200 dark:hover:bg-[#1f1f1f]"
                  >
                    Login
                  </Link>
                )}
              </div>

              {/* Mobile */}
              <div className="flex md:hidden">
                {session?.user ? (
                  <div className="flex md:hidden items-center gap-2">
                    <NotificationBell userId={session.user.id!} />
                    <DropdownMobile session={session} onLogoutClick={() => setIsLogoutModalOpen(true)} />
                  </div>
                ) : (
                  <DropdownMobile session={session} onLogoutClick={() => setIsLogoutModalOpen(true)} />
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}
