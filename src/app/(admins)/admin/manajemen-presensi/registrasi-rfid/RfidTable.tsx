// app/(admins)/admin/manajemen-presensi/registrasi-rfid/RfidTable.tsx
"use client";

import React, { Fragment, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { useDebouncedCallback } from "use-debounce";
import { LuCircleArrowLeft, LuCircleArrowRight, LuLoader } from "react-icons/lu";
import axios from "axios";
import { Dialog, Transition } from "@headlessui/react";

type AlatType = { id: string; name: string; mode: string; status: "AKTIF" | "NONAKTIF" };
type MahasiswaData = {
  id: string;
  nim: string | null;
  name: string | null;
  uid: string | null;
  semester: { name: string } | null;
  golongan: { name: string } | null;
};

export default function RfidTable({
  data,
  totalPages,
  currentPage,
  initialSearch,
  initialStatusFilter,
}: {
  data: MahasiswaData[];
  totalPages: number;
  currentPage: number;
  initialSearch?: string;
  initialStatusFilter?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alatList, setAlatList] = useState<AlatType[]>([]);
  const [loadingAlat, setLoadingAlat] = useState(false);
  const [selectedMahasiswa, setSelectedMahasiswa] = useState<MahasiswaData | null>(null);

  const openModal = async (mahasiswa: MahasiswaData) => {
    setSelectedMahasiswa(mahasiswa);
    setLoadingAlat(true);
    setIsModalOpen(true);
    try {
      const res = await axios.get("/api/alat-presensi");
      setAlatList(res.data);
    } catch (e) {
      console.error("Gagal mengambil daftar alat:", e);
      alert("Gagal mengambil daftar alat presensi.");
      setIsModalOpen(false);
    } finally {
      setLoadingAlat(false);
    }
  };

  const handleChooseAlat = (alatId: string, mahasiswaId: string) => {
    setIsModalOpen(false);
    router.push(`/admin/manajemen-presensi/registrasi-rfid/${mahasiswaId}?alatId=${alatId}`);
  };

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`?${params.toString()}`);
  };

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
    router.replace(`?${params.toString()}`);
  }, 500);

  const displayValue = (val?: string | null) => (val && val.trim() !== "" ? val : "-");
  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div>
          <label htmlFor="search" className="text-sm mb-1 block text-gray-700 dark:text-gray-200">
            Filter Pencarian
          </label>
          <input
            id="search"
            type="text"
            placeholder="Cari berdasarkan nama atau NIM mahasiswa..."
            defaultValue={initialSearch}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-100 px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-md bg-gray-50 dark:bg-black/50 text-sm focus:outline-none focus:shadow-[0_0_15px_0.5px] shadow-gray-400/60 dark:shadow-gray-600/50"
          />
        </div>
        <div>
          <label htmlFor="status" className="text-sm mb-1 block text-gray-700 dark:text-gray-200">
            Filter Status
          </label>
          <select
            id="status"
            value={initialStatusFilter || ""}
            onChange={(e) => updateFilter("statusRfid", e.target.value)}
            className="w-80 px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-md bg-gray-50 dark:bg-black/50 text-sm focus:outline-none focus:shadow-[0_0_15px_0.5px] shadow-gray-400/60 dark:shadow-gray-600/50"
          >
            <option value="" className="bg-white dark:bg-black/90">
              Semua Status
            </option>
            <option value="terdaftar" className="bg-white dark:bg-black/90">
              Sudah Terdaftar
            </option>
            <option value="belum_terdaftar" className="bg-white dark:bg-black/90">
              Belum Terdaftar
            </option>
          </select>
        </div>
      </div>

      <div className="overflow-auto rounded border border-gray-300 dark:border-gray-800 shadow-sm">
        <table className="min-w-full text-sm text-left text-black dark:text-gray-200">
          <thead className="bg-gray-100 dark:bg-black/40 uppercase tracking-wide">
            <tr>
              <th className="px-6 py-3 font-semibold">NIM</th>
              <th className="px-6 py-3 font-semibold">Nama Mahasiswa</th>
              <th className="px-6 py-3 font-semibold text-center">UID Kartu</th>
              <th className="px-6 py-3 font-semibold text-center">Smt/Gol</th>
              <th className="px-6 py-3 font-semibold text-center w-px whitespace-nowrap">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8">
                  Tidak ada mahasiswa ditemukan.
                </td>
              </tr>
            ) : (
              data.map((mhs) => (
                <tr
                  key={mhs.id}
                  className="border-t border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-black/30"
                >
                  <td className="px-6 py-4 font-mono">{displayValue(mhs.nim)}</td>
                  <td className="px-6 py-4 font-semibold">{displayValue(mhs.name)}</td>
                  <td className="px-6 py-4 font-mono text-center">{displayValue(mhs.uid)}</td>
                  <td className="px-6 py-4 text-center">
                    {displayValue(mhs.semester?.name)} / {displayValue(mhs.golongan?.name)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {mhs.uid ? (
                      <SubmitButton
                        text="Edit"
                        onClick={() => openModal(mhs)}
                        className="w-22 px-4 py-2 bg-neutral-700 text-neutral-100 dark:text-neutral-100 rounded-lg shadow-[0_0_20px_1px] shadow-neutral-800 dark:shadow-neutral-700 hover:transition-all hover:bg-neutral-800 hover:shadow-[0_0_20px_1px] hover:shadow-neutral-800 hover:dark:shadow-neutral-600"
                      />
                    ) : (
                      <SubmitButton
                        text="Registrasi"
                        onClick={() => openModal(mhs)}
                        className="w-22 px-4 py-2 bg-green-700 dark:bg-emerald-700 text-green-100 dark:text-emerald-100 rounded-lg shadow-[0_0_20px_1px] shadow-green-800 dark:shadow-emerald-700 hover:transition-all hover:bg-green-800 hover:shadow-[0_0_20px_1px] hover:shadow-emerald-800 hover:dark:shadow-emerald-600"
                      />
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsModalOpen(false)}>
          {/* Backdrop */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          </Transition.Child>

          {/* Konten Modal */}
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-[#111111] dark:border dark:border-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-semibold leading-6 text-gray-900 dark:text-gray-50"
                  >
                    Pilih Alat Presensi
                  </Dialog.Title>
                  <div className="mt-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Pilih alat yang akan digunakan untuk meregistrasi kartu RFID {""}
                      <strong>{selectedMahasiswa?.name}</strong>.
                    </p>
                  </div>

                  <div className="mt-4 space-y-2 max-h-60 overflow-auto border-t border-b border-gray-200 dark:border-gray-800 py-2">
                    {loadingAlat ? (
                      <div className="flex items-center justify-center gap-2 py-4">
                        <LuLoader className="animate-spin" /> Memuat daftar alat...
                      </div>
                    ) : alatList.length === 0 ? (
                      <p className="text-center text-sm text-gray-500 py-4">Tidak ada alat yang tersedia.</p>
                    ) : (
                      alatList.map((alat) => (
                        <div
                          key={alat.id}
                          className="flex justify-between items-center p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800/80 cursor-pointer transition-colors"
                          onClick={() => selectedMahasiswa && handleChooseAlat(alat.id, selectedMahasiswa.id)}
                        >
                          <div>
                            <p className="font-semibold">{alat.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Mode: {alat.mode}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium`}>
                            {alat.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="mt-5 sm:mt-6 text-right">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Batal
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm">
            Halaman {currentPage} dari {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Link
              href={createPageURL(currentPage - 1)}
              className={`px-3 py-1 text-sm rounded-md flex items-center gap-2 ${
                currentPage <= 1
                  ? "pointer-events-none bg-transparent dark:bg-black/80 border border-gray-300 dark:border-gray-800 text-gray-400"
                  : "bg-gray-100 dark:bg-gray-200 border border-gray-300 dark:border-gray-800 text-gray-800 dark:text-gray-800 hover:bg-gray-200 dark:hover:bg-gray-300 hover:transition-all"
              }`}
            >
              <LuCircleArrowLeft /> Sebelumnya
            </Link>
            <Link
              href={createPageURL(currentPage + 1)}
              className={`px-3 py-1 text-sm rounded-md flex items-center gap-2 ${
                currentPage >= totalPages
                  ? "pointer-events-none bg-transparent dark:bg-black/80 border border-gray-300 dark:border-gray-800 text-gray-400"
                  : "bg-gray-100 dark:bg-gray-200 border border-gray-300 dark:border-gray-800 text-gray-800 dark:text-gray-800 hover:bg-gray-200 dark:hover:bg-gray-300 hover:transition-all"
              }`}
            >
              Selanjutnya <LuCircleArrowRight />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
