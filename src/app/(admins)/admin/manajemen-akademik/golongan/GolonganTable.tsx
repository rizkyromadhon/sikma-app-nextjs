"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Golongan, ProgramStudi, Semester } from "@/generated/prisma/client";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { LuCircleAlert } from "react-icons/lu";
import Link from "next/link";
import { LuCircleArrowRight, LuCircleArrowLeft } from "react-icons/lu";
import { BsPlusCircleDotted } from "react-icons/bs";

type GolonganWithProdi = Golongan & {
  prodi: ProgramStudi;
  semester: Semester | null;
};

interface GolonganTableProps {
  initialData: GolonganWithProdi[];
  totalPages: number;
  currentPage: number;
  prodiList: ProgramStudi[];
  semesterList: Semester[];
  currentProdiFilter?: string;
  currentSemesterFilter?: string;
}

const GolonganTable = ({
  initialData,
  totalPages,
  currentPage,
  prodiList,
  semesterList,
  currentSemesterFilter,
  currentProdiFilter,
}: GolonganTableProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGolongan, setSelectedGolongan] = useState<GolonganWithProdi | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const createPaginationUrl = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    return `?${params.toString()}`;
  };

  const handleFilterChange = (param: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(param, value);
    } else {
      params.delete(param);
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const handleOpenModal = (golongan: GolonganWithProdi) => {
    setSelectedGolongan(golongan);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedGolongan(null);
  };

  function buildQueryWith(filters: URLSearchParams, updates: Record<string, string>) {
    const params = new URLSearchParams(filters);
    for (const [key, value] of Object.entries(updates)) {
      params.set(key, value);
    }
    return params.toString();
  }

  const handleConfirmDelete = async () => {
    if (!selectedGolongan) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/golongan/${selectedGolongan.id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Gagal menghapus golongan.");
      }

      const currentParams = new URLSearchParams(Array.from(searchParams.entries()));
      const updatedQuery = buildQueryWith(currentParams, {
        page: currentPage.toString(),
        golongan: "delete_success",
      });

      setIsModalOpen(false);
      router.push(`/admin/manajemen-akademik/golongan?${updatedQuery}`);
      console.log("Redirect to:", `/admin/manajemen-akademik/golongan?${updatedQuery}`);

      setIsModalOpen(false);
    } catch (error) {
      if (error instanceof Error) alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <select
              value={currentSemesterFilter || ""}
              onChange={(e) => handleFilterChange("semester", e.target.value)}
              className="w-60 px-4 py-2  border rounded-md bg-gray-50 dark:bg-black/50 dark:text-white border-gray-300 dark:border-gray-800 text-sm focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
            >
              <option value="" className="bg-white dark:bg-black/90">
                Semua Semester
              </option>
              {semesterList.map((smt) => (
                <option key={smt.id} value={smt.id} className="bg-white dark:bg-black/90">
                  {smt.name}
                </option>
              ))}
            </select>
            <select
              id="prodi"
              onChange={(e) => handleFilterChange("prodi", e.target.value)}
              value={currentProdiFilter || ""}
              className="w-60 px-4 py-2 border rounded-md bg-gray-50 dark:bg-black/50 dark:text-white border-gray-300 dark:border-gray-800 text-sm focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
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
          <div>
            <SubmitButton
              text="Tambah Golongan"
              href="/admin/manajemen-akademik/golongan/create"
              icon={<BsPlusCircleDotted />}
              className="w-fit bg-white dark:bg-black/50 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-black/10 hover:transition-all text-sm border border-gray-300 dark:border-gray-800 flex items-center gap-2 cursor-pointer"
            />
          </div>
        </div>
      </div>
      <div className="overflow-auto rounded border border-gray-300 dark:border-gray-800 shadow-sm">
        <table className="min-w-full text-sm text-left text-black dark:text-gray-200">
          <thead className="bg-gray-100 dark:bg-black/40 uppercase tracking-wide text-gray-600 dark:text-gray-300">
            <tr>
              <th className="px-6 py-3 font-semibold">Semester</th>
              <th className="px-6 py-3 font-semibold ">Program Studi</th>
              <th className="px-6 py-3 font-semibold text-center">Nama Golongan</th>
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
                  <td className="px-6 py-4">{golongan.semester?.name ?? "-"}</td>
                  <td className="px-6 py-4">{golongan.prodi.name}</td>
                  <td className="px-6 py-4 text-center">{golongan.name}</td>
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

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-gray-700 dark:text-gray-400">
            Halaman {currentPage} dari {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Link
              href={createPaginationUrl(currentPage - 1)}
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
              href={createPaginationUrl(currentPage + 1)}
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
