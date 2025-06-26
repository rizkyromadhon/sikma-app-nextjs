"use client";

import { Fragment, useRef, useState } from "react";
import { Menu, MenuButton, MenuItem, MenuItems, Textarea, Transition } from "@headlessui/react";
import Link from "next/link";
import Image from "next/image";
import { LuUser, LuLogOut, LuChevronDown, LuLayoutDashboard, LuFlag, LuClipboardList } from "react-icons/lu";
import type { Session } from "next-auth";
import { FaUserCircle } from "react-icons/fa";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface DropdownDesktopProps {
  session: Session;
  onLogoutClick: () => void;
}

export default function DropdownDesktop({ session, onLogoutClick }: DropdownDesktopProps) {
  const [isShowing, setIsShowing] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);

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
          <div className="absolute -top-1 right-5 h-3 w-3 rotate-45 transform bg-white dark:bg-neutral-950 border-l border-t border-gray-200 dark:border-neutral-800 focus:outline-none"></div>

          <MenuItems
            static
            className="w-full divide-y divide-gray-200 dark:divide-neutral-800 rounded-xl bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 shadow-[0px_0_20px_1px_rgba(0,0,0,0.2)] focus:outline-none"
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
                        focus ? "bg-gray-100 dark:bg-neutral-800" : ""
                      } group flex w-full items-center px-3 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-neutral-200 dark:hover:bg-gray-800/50`}
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
                      href={"/profile"}
                      className={`${
                        focus ? "bg-neutral-100 dark:bg-neutral-800" : ""
                      } group flex w-full items-center px-3 py-3 text-sm font-medium text-gray-700 dark:text-gray-300  hover:bg-neutral-200/50 hover:transition-all dark:hover:bg-neutral-800/50 focus:outline-none`}
                    >
                      <LuUser className="mr-2 h-5 w-5" />
                      Profil Saya
                    </Link>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ focus }) => (
                    <Link
                      href="/laporan-saya"
                      className={`${
                        focus ? "bg-neutral-100 dark:bg-neutral-800" : ""
                      } group flex w-full items-center px-3 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50`}
                    >
                      <LuClipboardList className="h-5 w-5 mr-2" />
                      Laporan Saya
                    </Link>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ focus }) => (
                    <button
                      onClick={() => setIsReportOpen(true)}
                      className={`${
                        focus ? "bg-neutral-100 dark:bg-neutral-800" : ""
                      }group flex w-full items-center px-3 py-3 text-sm font-medium text-gray-700 dark:text-gray-300  hover:bg-neutral-200/50 hover:transition-all dark:hover:bg-neutral-800/50 focus:outline-none cursor-pointer`}
                    >
                      <LuFlag className="mr-2 h-5 w-5" />
                      Lapor ke Admin
                    </button>
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
                    } group flex w-full items-center rounded-b-xl px-3 py-3 text-sm font-medium text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/40 dark:hover:text-neutral-200 transition-colors focus:outline-none cursor-pointer`}
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
      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lapor ke Admin</DialogTitle>
          </DialogHeader>
          <form
            ref={formRef}
            onSubmit={async (e) => {
              e.preventDefault();
              setIsSubmitting(true);

              try {
                const form = new FormData(formRef.current!);

                const res = await fetch("/api/laporan", {
                  method: "POST",
                  body: form,
                });

                if (!res.ok) throw new Error("Gagal mengirim laporan");

                setIsReportOpen(false);
                formRef.current?.reset();

                router.replace(`${pathname}?flash=laporan_success`);
              } catch (err) {
                console.error(err);
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            <div>
              <label className="text-sm mb-1 block">Tipe Laporan</label>
              <select
                name="tipe"
                required
                className="w-full border border-border bg-muted rounded-md px-3 py-2 text-sm"
              >
                <option value="">Pilih tipe laporan</option>
                <option value="Kartu RFID Hilang/Rusak">Kartu RFID Hilang/Rusak</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="text-sm mb-1 mt-2 block">Pesan</label>
              <Textarea
                name="pesan"
                required
                placeholder="Tulis laporan atau kendala Anda..."
                className="px-4 py-2 text-sm text-neutral-700 dark:text-neutral-400 block bg-muted/40 border border-neutral-200 dark:border-neutral-700 w-full rounded-md focus:outline-none focus:shadow-[0_0_2px_2px] shadow-neutral-400/80 transition-all duration-200 ease-in-out mb-4"
              />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Mengirim...
                  </span>
                ) : (
                  "Kirim"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Menu>
  );
}
