"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ProgramStudi } from "@/generated/prisma/client";
import { SubmitButton } from "@/components/auth/SubmitButton";

interface ProdiTableProps {
  data: ProgramStudi[];
}

const ProdiTable = ({ data }: ProdiTableProps) => {
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProdi, setSelectedProdi] = useState<ProgramStudi | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenModal = (prodi: ProgramStudi) => {
    setSelectedProdi(prodi);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProdi(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedProdi) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/prodi/${selectedProdi.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Gagal menghapus program studi.");
      }
      handleCloseModal();
      router.push("/admin/manajemen-akademik/program-studi?program-studi=delete_success");
      router.refresh();
    } catch (error) {
      if (error instanceof Error) alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="overflow-auto rounded border border-gray-300 dark:border-gray-800 shadow-sm">
        <table className="min-w-full text-sm text-left text-black dark:text-gray-200">
          <thead className="bg-gray-100 dark:bg-black/40 uppercase tracking-wide text-gray-600 dark:text-gray-300">
            <tr>
              <th className="px-6 py-3 font-semibold">ID</th>
              <th className="px-6 py-3 font-semibold w-full">Nama Program Studi</th>
              <th className="px-6 py-3 font-semibold text-center w-px whitespace-nowrap">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-8 text-gray-400 dark:text-gray-300">
                  Belum ada data program studi.
                </td>
              </tr>
            ) : (
              data.map((prodi) => (
                <tr
                  key={prodi.id}
                  className="border-t border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-black/30 hover:transition-all bg-white dark:bg-black/10"
                >
                  <td className="px-6 py-4 font-medium whitespace-nowrap">{prodi.id}</td>
                  <td className="px-6 py-4">{prodi.name}</td>
                  <td className="px-6 py-4 flex items-center gap-4 justify-center">
                    <SubmitButton
                      href={`/admin/manajemen-akademik/program-studi/${prodi.id}/edit`}
                      text="Edit"
                      className="bg-white w-18 dark:bg-black/50 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-[#1A1A1A] hover:transition-all text-sm border border-gray-300 dark:border-gray-800"
                    />
                    <SubmitButton
                      text="Hapus"
                      onClick={() => handleOpenModal(prodi)}
                      className="bg-red-700 w-18 dark:bg-red-800/80 text-white dark:text-gray-200 px-4 py-2 rounded-md hover:bg-red-800 dark:hover:bg-red-950 hover:transition-all text-sm border-none"
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-black/80 dark:backdrop-blur-sm rounded-lg p-6 w-full max-w-md mx-4 shadow-[0_0_30px_2px_#C10007] dark:shadow-[0_0_34px_4px_#460809]">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Konfirmasi Hapus</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Apakah Anda yakin ingin menghapus <span className="font-semibold">{selectedProdi?.name}</span>?
              Tindakan ini tidak dapat dibatalkan.
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

export default ProdiTable;
