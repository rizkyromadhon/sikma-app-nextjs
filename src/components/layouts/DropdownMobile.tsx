"use client";

import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import Link from "next/link";
import { Fragment } from "react";
import { type Session } from "next-auth";
import { LuUser, LuLogOut, LuMenu } from "react-icons/lu";
import Image from "next/image";
import { FaUserCircle } from "react-icons/fa";

interface DropdownMobileProps {
  session: Session | null;
  onLogoutClick: () => void;
}

export default function DropdownMobile({ session, onLogoutClick }: DropdownMobileProps) {
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/jadwal-kuliah", label: "Jadwal Kuliah" },
    { href: "/presensi-kuliah", label: "Presensi Kuliah" },
    { href: "/pusat-bantuan", label: "Pusat Bantuan" },
  ];

  return (
    <div className="md:hidden">
      <Menu as="div" className="relative">
        <MenuButton className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none">
          <span className="sr-only">Open menu</span>
          <LuMenu className="h-6 w-6" />
        </MenuButton>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <MenuItems
            static
            className="absolute right-0 top-full mt-2 w-64 origin-top-right rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-700 shadow-xl focus:outline-none"
          >
            {session?.user ? (
              <>
                <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3">
                  <div className="h-10 w-10 flex-shrink-0 rounded-full border-2 border-gray-300 dark:border-gray-700">
                    {session.user.image ? (
                      <Image
                        className="rounded-full"
                        src={session.user.image}
                        alt="Foto profil"
                        width={40}
                        height={40}
                      />
                    ) : (
                      <FaUserCircle className="h-full w-full text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{session.user.name}</p>
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                      {session.user.nim || session.user.nip || session.user.email}
                    </p>
                  </div>
                </div>
                <div className="py-2">
                  {navLinks.map(({ href, label }) => (
                    <MenuItem key={href}>
                      <Link
                        href={href}
                        className="block px-4 py-2 text-base text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        {label}
                      </Link>
                    </MenuItem>
                  ))}
                </div>
                <div className="py-2 border-t border-gray-200 dark:border-gray-800">
                  <MenuItem>
                    <Link
                      href="/profil"
                      className="group flex w-full items-center px-4 py-2 text-base text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <LuUser className="mr-3 h-5 w-5 text-gray-500" />
                      Profil Saya
                    </Link>
                  </MenuItem>
                  <MenuItem>
                    <button
                      onClick={onLogoutClick}
                      className="group flex w-full items-center px-4 py-2 text-base text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50"
                    >
                      <LuLogOut className="mr-3 h-5 w-5" />
                      Logout
                    </button>
                  </MenuItem>
                </div>
              </>
            ) : (
              <>
                <div className="py-1">
                  {navLinks.map(({ href, label }) => (
                    <MenuItem key={href}>
                      <Link
                        href={href}
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        {label}
                      </Link>
                    </MenuItem>
                  ))}
                </div>
                <div className="py-1 border-t border-gray-200 dark:border-gray-700">
                  <MenuItem>
                    <Link
                      href="/login"
                      className="block w-full text-left px-4 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Login
                    </Link>
                  </MenuItem>
                </div>
              </>
            )}
          </MenuItems>
        </Transition>
      </Menu>
    </div>
  );
}
