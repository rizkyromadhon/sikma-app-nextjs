"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Golongan, ProgramStudi } from "@/generated/prisma/client";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { LuCircleAlert } from "react-icons/lu";
import Link from "next/link";
import { LuCircleArrowRight, LuCircleArrowLeft } from "react-icons/lu";

type GolonganWithProdi = Golongan & {
  prodi: ProgramStudi;
};

interface GolonganTableProps {
  initialData: GolonganWithProdi[];
  totalPages: number;
  currentPage: number;
  prodiList: ProgramStudi[];
  currentProdiFilter?: string;
}

const GolonganTable = ({
  initialData,
  totalPages,
  currentPage,
  prodiList,
  currentProdiFilter,
}: GolonganTableProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGolongan, setSelectedGolongan] = useState<GolonganWithProdi | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const prodiId = e.target.value;
    const params = new URLSearchParams(searchParams);
    if (prodiId) {
      params.set("prodi", prodiId);
    } else {
      params.delete("prodi");
    }
    params.set("page", "1");
    router.push(`/admin/manajemen-akademik/golongan?${params.toString()}`);
  };

  const handleOpenModal = (golongan: GolonganWithProdi) => {
    setSelectedGolongan(golongan);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedGolongan(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedGolongan) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/golongan/${selectedGolongan.id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Gagal menghapus golongan.");
      }
      setIsModalOpen(false);

      // Menggunakan router.replace agar tidak menambah history browser
      // dan `scroll: false` untuk mempertahankan posisi scroll
      const params = new URLSearchParams(searchParams);
      params.set("golongan", "delete_success");
      router.replace(`/admin/manajemen-akademik/golongan?${params.toString()}`, { scroll: false });
      router.refresh();
    } catch (error) {
      if (error instanceof Error) alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="mb-4">
        <select
          onChange={handleFilterChange}
          value={currentProdiFilter || ""}
          className="w-full px-4 py-2 max-w-1/4 border rounded-md bg-gray-50 dark:bg-black/50 dark:text-white border-gray-300 dark:border-gray-800 text-sm focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
        >
          <option value="" className="bg-white dark:bg-black/90">
            Semua Program Studi
          </option>
          {prodiList.map((prodi) => (
            <option key={prodi.id} value={prodi.id} className="bg-white dark:bg-black/90">
              {prodi.name}
            </option>
          ))}
        </select>
      </div>
      <div className="overflow-auto rounded border border-gray-300 dark:border-gray-800 shadow-sm">
        <table className="min-w-full text-sm text-left text-black dark:text-gray-200">
          <thead className="bg-gray-100 dark:bg-black/40 uppercase tracking-wide text-gray-600 dark:text-gray-300">
            <tr>
              <th className="px-6 py-3 font-semibold">ID</th>
              <th className="px-6 py-3 font-semibold ">Nama Golongan</th>
              <th className="px-6 py-3 font-semibold ">Program Studi</th>
              <th className="px-6 py-3 font-semibold text-center w-px whitespace-nowrap">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {initialData?.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-400 dark:text-gray-300">
                  Belum ada data golongan.
                </td>
              </tr>
            ) : (
              initialData?.map((golongan) => (
                <tr
                  key={golongan.id}
                  className="border-t border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-black/30 hover:transition-all bg-white dark:bg-black/10"
                >
                  <td className="px-6 py-4 font-medium whitespace-nowrap">{golongan.id}</td>
                  <td className="px-6 py-4">{golongan.name}</td>
                  <td className="px-6 py-4">{golongan.prodi.name}</td>
                  <td className="px-6 py-4 flex items-center gap-4 justify-center">
                    <SubmitButton
                      href={`/admin/manajemen-akademik/golongan/${golongan.id}/edit`}
                      text="Edit"
                      className="bg-white w-18 dark:bg-black/50 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-[#1A1A1A] hover:transition-all text-sm border border-gray-300 dark:border-gray-800"
                    />
                    <SubmitButton
                      text="Hapus"
                      onClick={() => handleOpenModal(golongan)}
                      className="bg-red-700 w-18 dark:bg-red-800/80 text-white dark:text-gray-200 px-4 py-2 rounded-md hover:bg-red-800 dark:hover:bg-red-950 hover:transition-all text-sm border-none"
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Kontrol Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-gray-700 dark:text-gray-400">
            Halaman {currentPage} dari {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Link
              href={`?page=${currentPage - 1}&prodi=${currentProdiFilter || ""}`}
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
              href={`?page=${currentPage + 1}&prodi=${currentProdiFilter || ""}`}
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
              Apakah Anda yakin ingin menghapus <strong>{selectedGolongan?.name}</strong> -{" "}
              <strong>{selectedGolongan?.prodi.name}</strong>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Tindakan ini tidak dapat dibatalkan.
              </p>
            </p>
            <div className="mt-6 flex justify-end gap-4">
              <SubmitButton
                text="Batal"
                onClick={handleCloseModal}
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
    </>
  );
};

export default GolonganTable;
