"use client";

import Link from "next/link";
import type { Session } from "next-auth";
import DropdownDesktop from "../DropdownDesktop";
import LogoutModal from "@/components/common/LogoutModal";
import { signOut } from "next-auth/react";
import { useState } from "react";

interface NavbarDosenClientProps {
  session: Session | null;
}

export default function NavbarDosenClient({ session }: NavbarDosenClientProps) {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogout = () => {
    signOut({ callbackUrl: "/login?logout=success" });
  };
  return (
    <>
      <nav
        className={`sticky top-0 z-50 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50`}
      >
        <div className="mx-auto max-w-12/13 ">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-16">
              <Link href="/" className="text-2xl font-bold tracking-tight text-black dark:text-white">
                &apos;SIKMA&apos;
              </Link>
            </div>
            <div className="z-10 flex items-center">
              <div className="hidden md:block">
                {session?.user ? (
                  <DropdownDesktop session={session} onLogoutClick={() => setIsLogoutModalOpen(true)} />
                ) : (
                  <Link
                    href="/login"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200 border-1 rounded-md px-4 py-2 border-slate-700 hover:bg-[#1f1f1f]"
                  >
                    Login
                  </Link>
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
