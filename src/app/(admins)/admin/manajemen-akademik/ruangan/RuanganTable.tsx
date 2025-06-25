"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Ruangan } from "@/generated/prisma/client";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { LuCircleAlert, LuCircleArrowLeft, LuCircleArrowRight } from "react-icons/lu";
import { useDebouncedCallback } from "use-debounce";
import axios from "axios";
import Link from "next/link";
import { BsPlusCircleDotted } from "react-icons/bs";

interface Props {
  data: Ruangan[];
  initialSearch?: string;
  totalPages: number;
  currentPage: number;
}

export default function RuanganTable({ data, initialSearch, totalPages, currentPage }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRuangan, setSelectedRuangan] = useState<Ruangan | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
    router.replace(`?${params.toString()}`);
  }, 300);

  const handleOpenModal = (ruangan: Ruangan) => {
    setSelectedRuangan(ruangan);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedRuangan) return;
    setIsLoading(true);
    try {
      const { data } = await axios.delete(`/api/ruangan/${selectedRuangan.id}`);
      console.log(data);
      setIsModalOpen(false);

      const params = new URLSearchParams(searchParams);
      params.set("ruangan", "delete_success");
      router.replace(`?${params.toString()}`, { scroll: false });
      router.refresh();
    } catch (error) {
      if (error instanceof Error) alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <input
          type="text"
          placeholder="Cari berdasarkan kode atau nama ruangan..."
          defaultValue={initialSearch}
          onChange={(e) => handleSearch(e.target.value)}
          className="bg-white dark:bg-black/50 text-black dark:text-gray-200 border border-gray-300 dark:border-gray-800 rounded px-4 py-2 focus:outline-none text-sm w-88"
        />
        <SubmitButton
          text="Tambah Ruangan"
          href="/admin/manajemen-akademik/ruangan/create"
          icon={<BsPlusCircleDotted />}
          className="bg-white dark:bg-black/50 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-black/10 hover:transition-all text-sm border border-gray-300 dark:border-gray-800 flex items-center gap-2"
        />
      </div>

      <div className="overflow-auto rounded border border-gray-300 dark:border-gray-800 shadow-sm">
        <table className="min-w-full text-sm text-left text-black dark:text-gray-200">
          <thead className="bg-gray-100 dark:bg-black/40 uppercase tracking-wide">
            <tr>
              <th className="px-6 py-3 font-semibold">Kode</th>
              <th className="px-6 py-3 font-semibold">Nama Ruangan</th>
              <th className="px-6 py-3 font-semibold">Tipe</th>
              <th className="px-6 py-3 font-semibold text-center w-px whitespace-nowrap">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8">
                  Tidak ada ruangan ditemukan.
                </td>
              </tr>
            ) : (
              data.map((ruangan) => (
                <tr
                  key={ruangan.id}
                  className="border-t border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-black/30"
                >
                  <td className="px-6 py-4 font-mono">{ruangan.kode}</td>
                  <td className="px-6 py-4">{ruangan.name}</td>
                  <td className="px-6 py-4">{ruangan.type}</td>
                  <td className="px-6 py-4 flex items-center gap-4 justify-center">
                    <SubmitButton
                      text="Edit"
                      href={`/admin/manajemen-akademik/ruangan/${ruangan.id}/edit`}
                      className="bg-white w-18 dark:bg-black/50 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-[#1A1A1A] hover:transition-all text-sm border border-gray-300 dark:border-gray-800"
                    />
                    <SubmitButton
                      text="Hapus"
                      onClick={() => handleOpenModal(ruangan)}
                      className="bg-red-700 w-18 dark:bg-red-800/80 text-white dark:text-gray-200 px-4 py-2 rounded-md hover:bg-red-800 dark:hover:bg-red-950 hover:transition-all text-sm border-none"
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-gray-700 dark:text-gray-400">
            Halaman {currentPage} dari {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Link
              href={`?page=${currentPage - 1}`}
              className={`px-3 py-1 text-sm rounded-md flex items-center gap-2 ${
                currentPage <= 1
                  ? "pointer-events-none bg-transparent dark:bg-black/80 border border-gray-300 dark:border-gray-800 text-gray-400"
                  : "bg-gray-100 dark:bg-gray-200 border border-gray-300 dark:border-gray-800 text-gray-800 dark:text-gray-800 hover:bg-gray-200 dark:hover:bg-gray-300 hover:transition-all"
              }`}
            >
              <LuCircleArrowLeft />
              Sebelumnya
            </Link>
            <Link
              href={`?page=${currentPage + 1}`}
              className={`px-3 py-1 text-sm rounded-md flex items-center gap-2 ${
                currentPage >= totalPages
                  ? "pointer-events-none bg-transparent dark:bg-black/80 border border-gray-300 dark:border-gray-800 text-gray-400"
                  : "bg-gray-100 dark:bg-gray-200 border border-gray-300 dark:border-gray-800 text-gray-800 dark:text-gray-800 hover:bg-gray-200 dark:hover:bg-gray-300 hover:transition-all"
              }`}
            >
              Selanjutnya
              <LuCircleArrowRight />
            </Link>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-black/80 dark:backdrop-blur-sm rounded-lg p-6 w-full max-w-lg mx-4 shadow-[0_0_30px_2px_#C10007] dark:shadow-[0_0_34px_4px_#460809]">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <LuCircleAlert className="w-6 h-6 text-red-600" /> Konfirmasi Hapus
            </h2>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
              Apakah Anda yakin ingin menghapus ruangan :
              <p className="font-bold text-sm mt-2 mb-2">
                {selectedRuangan?.name} ({selectedRuangan?.kode}) ?
              </p>
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="mt-6 flex justify-end gap-4">
              <SubmitButton
                text="Batal"
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-200 dark:bg-black dark:border dark:border-gray-800 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md text-sm hover:bg-gray-300 dark:hover:bg-slate-800 transition-all"
              />
              <SubmitButton
                text="Ya, Hapus"
                isLoading={isLoading}
                onClick={handleConfirmDelete}
                className="bg-red-600 dark:bg-red-800 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 dark:hover:bg-red-950 transition-all"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
