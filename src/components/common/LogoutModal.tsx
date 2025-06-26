"use client";

import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { Fragment, useState } from "react";
import { LuLogOut, LuTriangleAlert } from "react-icons/lu";
import { SubmitButton } from "../auth/SubmitButton";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const handleConfirmClick = () => {
    setIsLoading(true); // Set loading saat tombol diklik
    onConfirm(); // Jalankan fungsi logout yang sebenarnya
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-950 p-6 text-left align-middle  transition-all border border-gray-200 dark:border-neutral-800 shadow-[0_0_30px_1px] shadow-neutral-400 dark:shadow-neutral-800">
                <div className="flex items-start gap-4">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/50 sm:mx-0 sm:h-10 sm:w-10">
                    <LuTriangleAlert className="h-6 w-6 text-red-600 dark:text-red-500" aria-hidden="true" />
                  </div>
                  <div className="mt-0 flex-1">
                    <DialogTitle
                      as="h3"
                      className="text-base font-semibold leading-6 text-neutral-900 dark:text-gray-50"
                    >
                      Konfirmasi Logout
                    </DialogTitle>
                    <div className="mt-2">
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Apakah anda yakin ingin keluar dari sesi ini?
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tombol Aksi */}
                <div className="mt-8 flex justify-end gap-3">
                  <button
                    type="button"
                    disabled={isLoading}
                    className="rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#141414] "
                    onClick={onClose}
                  >
                    Batal
                  </button>
                  <div className="flex items-center">
                    <SubmitButton
                      icon={<LuLogOut className="h-4 w-4" />}
                      text="Ya, Logout"
                      type="button"
                      isLoading={isLoading}
                      className="inline-flex items-center gap-2 justify-center rounded-lg border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                      onClick={handleConfirmClick}
                    />
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
