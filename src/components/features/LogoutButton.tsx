"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { MenuItem } from "@headlessui/react";
import { LuLogOut } from "react-icons/lu";
import LogoutModal from "@/components/common/LogoutModal";

interface AuthButtonProps {
  className?: string;
}

export default function AuthButton({ className }: AuthButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <>
      <MenuItem>
        {({ focus }) => (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsModalOpen(true);
            }}
            className={`${className} ${
              focus ? "bg-red-50 dark:bg-red-900/50" : ""
            } group flex w-full items-center rounded-md px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400`}
          >
            <LuLogOut className="mr-2 h-5 w-5" />
            Logout
          </button>
        )}
      </MenuItem>

      <LogoutModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleLogout} />
    </>
  );
}
