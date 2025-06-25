// app/(admins)/admin/manajemen-akademik/dosen/DosenTable.tsx
"use client";

import React, { useState, ChangeEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { User, ProgramStudi } from "@/generated/prisma/client";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { LuCircleAlert, LuCircleArrowLeft, LuCircleArrowRight } from "react-icons/lu";
import { BsPlusCircleDotted } from "react-icons/bs";

// Tipe data untuk props
type DosenWithProdi = User & { prodi: ProgramStudi | null };
interface FilterOption {
  id: string | number;
  name: string;
}
interface FilterState {
  prodi?: string;
  nip?: string;
}

export default function DosenTable({
  data,
  totalPages,
  currentPage,
  filters,
}: {
  data: DosenWithProdi[];
  totalPages: number;
  currentPage: number;
  filters: { prodis: FilterOption[]; current: FilterState };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDosen, setSelectedDosen] = useState<DosenWithProdi | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const handleOpenModal = (dosen: DosenWithProdi) => {
    setSelectedDosen(dosen);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDosen) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/dosen/${selectedDosen.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Gagal menghapus dosen.");
      setIsModalOpen(false);
      const params = new URLSearchParams(searchParams.toString());
      params.set("dosen", "delete_success");
      router.replace(`?${params.toString()}`, { scroll: false });
      router.refresh();
    } catch (error) {
      if (error instanceof Error) alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const displayValue = (val?: string | null) => (val && val.trim() !== "" ? val : "-");

  return (
    <div className="space-y-6">
      {/* --- Filter --- */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <select
            className=" px-4 py-2 border rounded-md bg-gray-50 dark:bg-black/50 dark:text-white border-gray-300 dark:border-gray-800 text-sm focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none w-60"
            value={filters.current.prodi || ""}
            onChange={(e) => updateFilter("prodi", e.target.value)}
          >
            <option value="" className="bg-white dark:bg-black/90">
              Semua Program Studi
            </option>
            {filters.prodis.map((p) => (
              <option key={p.id} value={p.id.toString()} className="bg-white dark:bg-black/90">
                {p.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Cari Dosen berdasarkan NIP..."
            className="bg-white dark:bg-black/50 text-black dark:text-gray-200 border border-gray-300 dark:border-gray-800 rounded-md px-4 py-2 focus:outline-none text-sm w-80"
            defaultValue={filters.current.nip || ""}
            onChange={(e: ChangeEvent<HTMLInputElement>) => updateFilter("nip", e.target.value)}
          />
        </div>
        <SubmitButton
          text="Tambah Dosen"
          href="/admin/manajemen-akademik/dosen/create"
          icon={<BsPlusCircleDotted />}
          className="bg-white dark:bg-black/50 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-black/10 hover:transition-all text-sm border border-gray-300 dark:border-gray-800 flex items-center gap-2"
        />
      </div>

      {/* --- Tabel --- */}
      <div className="overflow-auto rounded border border-gray-300 dark:border-gray-800 shadow-sm">
        <table className="min-w-full text-sm text-left text-black dark:text-gray-200">
          <thead className="bg-gray-100 dark:bg-black/40 uppercase tracking-wide">
            <tr>
              <th className="px-6 py-3 font-semibold">NIP</th>
              <th className="px-6 py-3 font-semibold">Nama</th>
              <th className="px-6 py-3 font-semibold">Prodi</th>
              <th className="px-6 py-3 font-semibold text-center w-px whitespace-nowrap">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-400">
                  Tidak ada dosen ditemukan.
                </td>
              </tr>
            ) : (
              data.map((d) => (
                <tr
                  key={d.id}
                  className="border-t border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-black/30"
                >
                  <td className="px-6 py-4 font-mono">{displayValue(d.nip)}</td>
                  <td className="px-6 py-4">{displayValue(d.name)}</td>
                  <td className="px-6 py-4">{displayValue(d.prodi?.name)}</td>
                  <td className="px-6 py-4 flex items-center gap-4 justify-center">
                    <SubmitButton
                      text="Edit"
                      href={`/admin/manajemen-akademik/dosen/${d.id}/edit`}
                      className="bg-white w-18 dark:bg-black/50 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-[#1A1A1A] hover:transition-all text-sm border border-gray-300 dark:border-gray-800"
                    />
                    <SubmitButton
                      text="Hapus"
                      onClick={() => handleOpenModal(d)}
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
              Apakah Anda yakin ingin menghapus <strong>{selectedDosen?.name}</strong>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Tindakan ini tidak dapat dibatalkan.
              </p>
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
