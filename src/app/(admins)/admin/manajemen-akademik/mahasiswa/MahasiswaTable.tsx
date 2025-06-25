"use client";

import { SubmitButton } from "@/components/auth/SubmitButton";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChangeEvent, useEffect, useState } from "react";
import { LuCircleAlert, LuCircleArrowLeft, LuCircleArrowRight } from "react-icons/lu";
import { useDebouncedCallback } from "use-debounce";

interface MahasiswaData {
  id: string;
  nim?: string | null;
  name: string;
  prodi?: { name: string } | null;
  semester?: { name: string } | null;
  golongan?: { name: string; prodiId?: string } | null;
}

interface FilterOption {
  id: string | number;
  name: string;
  prodiId?: string;
  semesterId?: string;
}
interface FilterState {
  semester?: string;
  prodi?: string;
  golongan?: string;
  nim?: string;
}

export default function MahasiswaTable({
  data,
  filters,
  totalPages,
  currentPage,
}: {
  data: MahasiswaData[];
  totalPages: number;
  currentPage: number;
  filters: {
    semesters: FilterOption[];
    prodis: FilterOption[];
    golongans: FilterOption[];
    current: FilterState;
  };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMahasiswa, setSelectedMahasiswa] = useState<MahasiswaData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [filteredGolongans, setFilteredGolongans] = useState<FilterOption[]>([]);

  const { current, golongans } = filters;
  useEffect(() => {
    const prodiFilter = current.prodi;
    const semesterFilter = current.semester;

    if (prodiFilter && semesterFilter) {
      setFilteredGolongans(
        golongans.filter((g) => g.prodiId === prodiFilter && g.semesterId === semesterFilter)
      );
    } else {
      setFilteredGolongans([]);
    }
  }, [current, golongans]);

  const updateFilter = useDebouncedCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1"); // Selalu reset ke halaman 1

    if (key === "prodi" || key === "semester") {
      params.delete("golongan");
    }

    router.push(`?${params.toString()}`);
  }, 300);

  const handleOpenModal = (mahasiswa: MahasiswaData) => {
    setSelectedMahasiswa(mahasiswa);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedMahasiswa) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/mahasiswa/${selectedMahasiswa.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Gagal menghapus mahasiswa.");
      setIsModalOpen(false);
      const params = new URLSearchParams(searchParams.toString());
      params.set("mahasiswa", "delete_success");
      router.replace(`?${params.toString()}`, { scroll: false });
      router.refresh();
    } catch (error) {
      if (error instanceof Error) alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const displayValue = (val?: string | null) => (val && val.trim() !== "" ? val : "-");

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex items-center gap-4 w-full">
        <select
          className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-black/50 dark:text-white border-gray-300 dark:border-gray-800 text-sm focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
          value={filters.current.semester || ""}
          onChange={(e) => updateFilter("semester", e.target.value)}
        >
          <option value="" className="bg-white dark:bg-black/90">
            Semua Semester
          </option>
          {filters.semesters.map((s) => (
            <option key={s.id} value={s.id} className="bg-white dark:bg-black/90">
              {s.name}
            </option>
          ))}
        </select>
        <select
          className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-black/50 dark:text-white border-gray-300 dark:border-gray-800 text-sm focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
          value={filters.current.prodi || ""}
          onChange={(e) => updateFilter("prodi", e.target.value)}
        >
          <option value="" className="bg-white dark:bg-black/90">
            Semua Prodi
          </option>
          {filters.prodis.map((p) => (
            <option key={p.id} value={p.id} className="bg-white dark:bg-black/90">
              {p.name}
            </option>
          ))}
        </select>
        <select
          className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-black/50 dark:text-white border-gray-300 dark:border-gray-800 text-sm focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          value={filters.current.golongan || ""}
          onChange={(e) => updateFilter("golongan", e.target.value)}
          // Non-aktifkan jika prodi ATAU semester belum dipilih
          disabled={!filters.current.prodi || !filters.current.semester}
        >
          <option value="" className="bg-white dark:bg-black/90">
            {!filters.current.semester
              ? "Pilih salah satu semester"
              : !filters.current.prodi
              ? "Pilih salah satu prodi"
              : "Semua Golongan"}
          </option>
          {filteredGolongans.map((g) => (
            <option key={g.id} value={g.id.toString()} className="bg-white dark:bg-black/90">
              {g.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Cari Mahasiswa berdasarkan NIM..."
          className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-black/50 dark:text-white border-gray-300 dark:border-gray-800 text-sm focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          defaultValue={filters.current.nim || ""}
          onChange={(e: ChangeEvent<HTMLInputElement>) => updateFilter("nim", e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-auto rounded border border-gray-300 dark:border-gray-800 shadow-sm">
        <table className="min-w-full text-sm text-left text-black dark:text-gray-200">
          <thead className="bg-gray-100 dark:bg-black/40 uppercase tracking-wide text-gray-600 dark:text-gray-300">
            <tr>
              <th className="px-6 py-3 font-semibold">NIM</th>
              <th className="px-6 py-3 font-semibold">Nama</th>
              <th className="px-6 py-3 font-semibold">Prodi</th>
              <th className="px-6 py-3 font-semibold">Semester</th>
              <th className="px-6 py-3 font-semibold">Golongan</th>
              <th className="px-6 py-3 font-semibold text-center w-px whitespace-nowrap">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-400 dark:text-gray-300">
                  Tidak ada mahasiswa ditemukan.
                </td>
              </tr>
            ) : (
              data.map((m) => (
                <tr
                  key={m.id}
                  className="border-t border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-black/30 transition-colors duration-150 bg-black/10"
                >
                  <td className="px-6 py-4 font-mono">{displayValue(m.nim)}</td>
                  <td className="px-6 py-4">{displayValue(m.name)}</td>
                  <td className="px-6 py-4">{displayValue(m.prodi?.name)}</td>
                  <td className="px-6 py-4">{displayValue(m.semester?.name)}</td>
                  <td className="px-6 py-4">{displayValue(m.golongan?.name)}</td>
                  <td className="px-6 py-4 flex items-center gap-4 justify-center">
                    <SubmitButton
                      text="Edit"
                      href={`/admin/manajemen-akademik/mahasiswa/${m.id}/edit`}
                      className="bg-white w-18 dark:bg-black/50 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-[#1A1A1A] hover:transition-all text-sm border border-gray-300 dark:border-gray-800 flex items-center justify-center gap-2 cursor-pointer"
                    />
                    <SubmitButton
                      text="Hapus"
                      onClick={() => handleOpenModal(m)}
                      className="bg-red-700/80 w-18 dark:bg-red-800/80 text-white dark:text-gray-200 px-4 py-2 rounded-md hover:bg-red-700 dark:hover:bg-red-950 hover:transition-all text-sm border-none flex items-center justify-center gap-2 cursor-pointer"
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-black/80 dark:backdrop-blur-sm rounded-lg p-6 w-full max-w-lg mx-4 shadow-[0_0_30px_2px_#C10007] dark:shadow-[0_0_34px_4px_#460809]">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <LuCircleAlert className="w-6 h-6 text-red-600" /> Konfirmasi Hapus
            </h2>
            <div className="flex flex-col gap-1">
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                Anda yakin ingin menghapus mahasiswa :
              </p>
              <p className="font-bold text-sm text-gray-600 dark:text-gray-300">{selectedMahasiswa?.name}</p>
              <p></p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Semua data yang berkaitan dengan mahasiswa ini akan dihapus. Tindakan ini tidak dapat
                dibatalkan.
              </p>
            </div>
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
