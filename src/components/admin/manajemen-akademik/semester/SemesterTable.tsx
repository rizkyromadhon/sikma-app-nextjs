"use client";

import React from "react";
import { SemesterType } from "@/generated/prisma/client";
import { SubmitButton } from "@/components/auth/SubmitButton";

interface SemesterTableProps {
  data: {
    id: number | string;
    name: string;
    tipe: SemesterType;
  }[];
}

const SemesterTable = ({ data }: SemesterTableProps) => {
  return (
    <div className="overflow-auto rounded border border-gray-300 dark:border-gray-800 shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-black dark:text-gray-200">
          <thead className="bg-gray-100 dark:bg-black/40 uppercase tracking-wide text-gray-600 dark:text-gray-300">
            <tr>
              <th className="px-6 py-3 font-semibold">ID</th>
              <th className="px-6 py-3 font-semibold">Nama Semester</th>
              <th className="px-6 py-3 font-semibold">Tipe</th>
              <th className="px-6 py-3 font-semibold text-center w-px whitespace-nowrap">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-400 dark:text-gray-300">
                  Belum ada data semester.
                </td>
              </tr>
            ) : (
              data.map((semester) => (
                <tr
                  key={semester.id}
                  className="border-t border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-black/30 hover:transition-all bg-white dark:bg-black/10"
                >
                  <td className="px-6 py-4 font-medium whitespace-nowrap">{semester.id}</td>
                  <td className="px-6 py-4">{semester.name}</td>
                  <td className="px-6 py-4">{semester.tipe}</td>
                  <td className="px-6 py-4 flex items-center gap-4 justify-center">
                    <SubmitButton
                      text="Edit"
                      href={`/admin/manajemen-akademik/semester/${semester.id}/edit`}
                      className="bg-white w-18 dark:bg-black/50 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-[#1A1A1A] hover:transition-all text-sm border border-gray-300 dark:border-gray-800 flex items-center justify-center gap-2 cursor-pointer"
                    />
                    <SubmitButton
                      text="Hapus"
                      className="bg-red-700 w-18 dark:bg-red-800/80 text-white dark:text-gray-200 px-4 py-2 rounded-md hover:bg-red-800 dark:hover:bg-red-950 hover:transition-all text-sm border-none flex items-center justify-center gap-2 cursor-pointer"
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SemesterTable;
