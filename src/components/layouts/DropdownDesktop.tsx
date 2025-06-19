"use client";

import { Fragment, useState } from "react";
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import Link from "next/link";
import Image from "next/image";
import { LuUser, LuLogOut, LuChevronDown, LuLayoutDashboard } from "react-icons/lu";
import type { Session } from "next-auth";
import { FaUserCircle } from "react-icons/fa";

interface DropdownDesktopProps {
  session: Session;
  onLogoutClick: () => void;
}

export default function DropdownDesktop({ session, onLogoutClick }: DropdownDesktopProps) {
  const [isShowing, setIsShowing] = useState(false);

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div onMouseEnter={() => setIsShowing(true)} onMouseLeave={() => setIsShowing(false)}>
        <MenuButton className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none transition-colors">
          <div className="relative h-6 w-6 rounded-full">
            {session.user.image ? (
              <Image
                className="rounded-full object-cover"
                src={session.user.image}
                alt="Foto profil"
                fill
                sizes="24px"
              />
            ) : (
              <FaUserCircle className="h-full w-full text-gray-400" />
            )}
          </div>
          <span>{session.user.name}</span>
          <LuChevronDown
            className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
              isShowing ? "rotate-180" : ""
            }`}
          />
        </MenuButton>
      </div>

      <Transition
        as={Fragment}
        show={isShowing}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <div
          onMouseEnter={() => setIsShowing(true)}
          onMouseLeave={() => setIsShowing(false)}
          className="absolute right-0 mt-3 w-64 origin-top-right focus:outline-none"
        >
          <div className="absolute -top-1 right-5 h-3 w-3 rotate-45 transform bg-white dark:bg-black border-l border-t border-gray-200 dark:border-gray-900 focus:outline-none"></div>

          <MenuItems
            static
            className="w-full divide-y divide-gray-200 dark:divide-gray-700 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shadow-[0px_0_20px_1px_rgba(0,0,0,0.2)] focus:outline-none"
          >
            <div className="px-4 py-3">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{session.user.name}</p>
              <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                {session.user.nim || session.user.nip || session.user.email}
              </p>
            </div>

            {session.user.role === "ADMIN" && (
              <div>
                <MenuItem>
                  {({ focus }) => (
                    <Link
                      href="/admin/dashboard"
                      className={`${
                        focus ? "bg-gray-100 dark:bg-gray-800" : ""
                      } group flex w-full items-center px-3 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 dark:hover:bg-gray-800/50`}
                    >
                      <LuLayoutDashboard className="mr-2 h-5 w-5" />
                      Dashboard
                    </Link>
                  )}
                </MenuItem>
              </div>
            )}

            {session?.user.role !== "ADMIN" && (
              <div>
                <MenuItem>
                  {({ focus }) => (
                    <Link
                      href="/profil"
                      className={`${
                        focus ? "bg-gray-100 dark:bg-gray-800" : ""
                      } group flex w-full items-center px-3 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 dark:hover:bg-gray-800/50 focus:outline-none`}
                    >
                      <LuUser className="mr-2 h-5 w-5" />
                      Profil Saya
                    </Link>
                  )}
                </MenuItem>
              </div>
            )}

            <div>
              <MenuItem>
                {({ focus }) => (
                  <button
                    onClick={onLogoutClick}
                    className={`${
                      focus ? "bg-red-50 dark:bg-red-900/50 " : ""
                    } group flex w-full items-center rounded-b-xl px-3 py-3 text-sm font-medium text-red-600 dark:text-red-400 dark:hover:bg-red-900/40 transition-colors focus:outline-none`}
                  >
                    <LuLogOut className="mr-2 h-5 w-5" />
                    Logout
                  </button>
                )}
              </MenuItem>
            </div>
          </MenuItems>
        </div>
      </Transition>
    </Menu>
  );
}
