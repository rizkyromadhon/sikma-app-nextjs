"use client";

import React, { useState } from "react";
import { Semester } from "@/generated/prisma/client";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { useRouter } from "next/navigation";

interface SemesterTableProps {
  data: Semester[];
}

const SemesterTable = ({ data }: SemesterTableProps) => {
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenModal = (semester: Semester) => {
    setSelectedSemester(semester);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSemester(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedSemester) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/semester/${selectedSemester.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Gagal menghapus semester.");
      }

      handleCloseModal();
      router.push("/admin/manajemen-akademik/semester?semester=delete_success");
      router.refresh();
    } catch (error) {
      if (error instanceof Error) {
        alert(`Error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="overflow-auto rounded border border-gray-300 dark:border-neutral-800 shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-black dark:text-gray-200">
          <thead className="bg-gray-100 dark:bg-neutral-950/50 uppercase tracking-wide text-gray-600 dark:text-gray-300">
            <tr>
              <th className="px-6 py-3 font-semibold text-center">Nama Semester</th>
              <th className="px-6 py-3 font-semibold text-center">Tipe</th>
              <th className="px-6 py-3 font-semibold text-center w-px whitespace-nowrap">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-8 text-gray-400 dark:text-gray-300">
                  Belum ada data semester.
                </td>
              </tr>
            ) : (
              data.map((semester) => (
                <tr
                  key={semester.id}
                  className="border-t border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-950/40 hover:transition-all"
                >
                  <td className="px-6 py-4 text-center">{semester.name}</td>
                  <td className="px-6 py-4 text-center">{semester.tipe}</td>
                  <td className="px-6 py-4 flex items-center gap-4 justify-center">
                    <SubmitButton
                      text="Edit"
                      href={`/admin/manajemen-akademik/semester/${semester.id}/edit`}
                      className="bg-white w-18 dark:bg-neutral-950/40 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-[#1A1A1A] hover:transition-all text-sm border border-gray-300 dark:border-neutral-800 flex items-center justify-center gap-2 cursor-pointer"
                    />
                    <SubmitButton
                      text="Hapus"
                      onClick={() => handleOpenModal(semester)}
                      className="bg-red-700 w-18 dark:bg-red-800/80 text-white dark:text-gray-200 px-4 py-2 rounded-md hover:bg-red-800 dark:hover:bg-red-950 hover:transition-all text-sm border-none flex items-center justify-center gap-2 cursor-pointer"
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-950 dark:backdrop-blur-sm rounded-lg p-6 w-full max-w-lg mx-4 shadow-[0_0_30px_1px_#C10007] dark:shadow-[0_0_34px_1px_#460809]">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Konfirmasi Hapus</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Apakah Anda yakin ingin menghapus{" "}
              <span className="font-semibold">{selectedSemester?.name}</span>?
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Tindakan ini tidak dapat dibatalkan.</p>
            <div className="mt-6 flex justify-end gap-4">
              <SubmitButton
                text="Batal"
                onClick={handleCloseModal}
                className="bg-gray-200 dark:bg-neutral-900/50 dark:border dark:border-neutral-800 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md text-sm hover:bg-gray-300 dark:hover:bg-neutral-900 transition-all"
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
};

export default SemesterTable;
