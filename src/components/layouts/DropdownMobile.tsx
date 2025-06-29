"use client";

import { useRef, useState, Fragment } from "react";
import { Menu, MenuButton, MenuItem, MenuItems, Transition, Textarea } from "@headlessui/react";
import Link from "next/link";
import Image from "next/image";
import { type Session } from "next-auth";
import { LuUser, LuLogOut, LuMenu, LuFlag, LuClipboardList } from "react-icons/lu";
import { FaUserCircle } from "react-icons/fa";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { usePathname, useRouter } from "next/navigation";
import { CalendarCheck } from "lucide-react";

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

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const pathname = usePathname();

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
            className="absolute right-0 top-full mt-2 w-64 origin-top-right rounded-xl bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 shadow-xl focus:outline-none"
          >
            {session?.user ? (
              <>
                <div className="px-4 py-4 border-b border-gray-200 dark:border-neutral-800 flex items-center gap-3">
                  <div className="h-10 w-10 flex-shrink-0 rounded-full border-2 border-gray-300 dark:border-neutral-700">
                    {session.user.foto ? (
                      <Image
                        className="rounded-full"
                        src={session.user.foto}
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
                      href="/profile"
                      className="group flex w-full items-center px-4 py-2 text-base text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <LuUser className="mr-2 h-5 w-5 text-gray-500" />
                      Profil Saya
                    </Link>
                  </MenuItem>
                  <MenuItem>
                    {({ focus }) => (
                      <Link
                        href={"/pengajuan-izin"}
                        className="flex items-center gap-2 w-full px-4 py-2 text-base text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <CalendarCheck className="h-5 w-5 text-gray-500" />
                        Pengajuan Izin ke Dosen
                      </Link>
                    )}
                  </MenuItem>
                  <MenuItem>
                    <Link
                      href="/laporan-saya"
                      className="flex items-center gap-2 w-full px-4 py-2 text-base text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <LuClipboardList className="h-5 w-5 text-gray-500" />
                      Laporan Saya
                    </Link>
                  </MenuItem>

                  <MenuItem>
                    <button
                      onClick={() => setIsReportOpen(true)}
                      className="flex items-center gap-2 w-full px-4 py-2 text-base text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <LuFlag className="h-5 w-5 text-gray-500" />
                      Lapor ke Admin
                    </button>
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

        {/* Dialog Lapor */}
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

                  formRef.current?.reset();
                  setIsReportOpen(false);
                  router.replace(`${pathname}?flash=laporan_success`);
                } catch (error) {
                  console.error(error);
                } finally {
                  setIsSubmitting(false);
                }
              }}
              className="space-y-4"
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
                <label className="text-sm mb-1 block">Pesan</label>
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
    </div>
  );
}
