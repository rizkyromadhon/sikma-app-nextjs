"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { LuCircleAlert, LuCircleArrowLeft, LuCircleArrowRight } from "react-icons/lu";
import Link from "next/link";
import { useDebouncedCallback } from "use-debounce";

// Tipe data yang kompleks dari server
type JadwalKuliahData = {
  id: string;
  hari: string;
  jam_mulai: string;
  jam_selesai: string;
  mata_kuliah: { name: string };
  dosen: { name: string };
  semester: { name: string };
  golongans: { name: string }[];
  ruangan: { name: string };
  prodi: { name: string };
};

interface FilterOption {
  id: string;
  name: string;
}

interface JadwalKuliahTableProps {
  data: JadwalKuliahData[];
  totalPages: number;
  currentPage: number;
  filters: {
    semesters: FilterOption[];
    golongans: FilterOption[];
    current: { semester?: string; golongan?: string; search?: string };
  };
  prodiId: string;
}

export default function JadwalKuliahTable({
  data,
  totalPages,
  currentPage,
  filters,
  prodiId,
}: JadwalKuliahTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- 1. State Management untuk Modal Delete ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJadwal, setSelectedJadwal] = useState<JadwalKuliahData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [localSemester, setLocalSemester] = useState(filters.current.semester || "");
  const [localGolongan, setLocalGolongan] = useState(filters.current.golongan || "");
  const [golonganOptions, setGolonganOptions] = useState<FilterOption[]>(filters.golongans);

  useEffect(() => {
    if (!localSemester) {
      setGolonganOptions([]);
      setLocalGolongan("");
      return;
    }

    const fetchGolongan = async () => {
      const res = await fetch(`/api/golongan?semesterId=${localSemester}&prodiId=${prodiId}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setGolonganOptions(data);
      } else {
        console.error("API /api/golongan tidak mengembalikan array:", data);
        setGolonganOptions([]);
      }
      setLocalGolongan(""); // reset pilihan golongan
    };

    fetchGolongan();
  }, [localSemester, prodiId]);

  // --- 2. Event Handlers ---
  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1"); // Selalu reset ke halaman 1 saat filter berubah
    router.push(`?${params.toString()}`);
  };

  const handleSearch = useDebouncedCallback((term: string) => {
    handleFilterChange("search", term);
  }, 500); // Debounce 500ms

  const handleOpenModal = (jadwal: JadwalKuliahData) => {
    setSelectedJadwal(jadwal);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedJadwal(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedJadwal) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/jadwal-kuliah/${selectedJadwal.id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Gagal menghapus jadwal.");
      }
      handleCloseModal();
      const params = new URLSearchParams(searchParams);
      params.set("jadwal-kuliah", "delete_success");
      router.replace(`?${params.toString()}`, { scroll: false });
      router.refresh();
    } catch (error) {
      if (error instanceof Error) alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk membuat URL pagination sambil mempertahankan filter
  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      {/* --- Filter --- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="semester" className="block text-sm font-medium mb-1">
            Filter Semester
          </label>
          <select
            id="semester"
            value={localSemester}
            onChange={(e) => {
              const semesterValue = e.target.value;
              setLocalSemester(semesterValue);
              setLocalGolongan(""); // reset juga golongan di dropdown
              handleFilterChange("semester", semesterValue);
            }}
            className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-black/50 dark:text-white border-gray-300 dark:border-gray-800 text-sm focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
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
        </div>
        <div>
          <label htmlFor="golongan" className="block text-sm font-medium mb-1">
            Filter Golongan
          </label>
          <select
            id="golongan"
            value={localGolongan}
            onChange={(e) => {
              setLocalGolongan(e.target.value);
              handleFilterChange("golongan", e.target.value);
            }}
            disabled={!localSemester || golonganOptions.length === 0}
            className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-black/50 dark:text-white border-gray-300 dark:border-gray-800 text-sm focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {!localSemester && (
              <option value="" className="bg-white dark:bg-black/90">
                Pilih semester terlebih dahulu
              </option>
            )}

            {golonganOptions.length === 0 && (
              <option value="" className="bg-white dark:bg-black/90">
                Tidak ada golongan
              </option>
            )}
            <option value="" className="bg-white dark:bg-black/90">
              Semua Golongan
            </option>
            {golonganOptions.map((g) => (
              <option key={g.id} value={g.id} className="bg-white dark:bg-black/90">
                {g.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="search" className="block text-sm font-medium mb-1">
            Filter Pencarian
          </label>
          <input
            id="search"
            type="text"
            placeholder="Cari Matkul, Dosen, Ruangan..."
            defaultValue={filters.current.search || ""}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-black/50 dark:text-white border-gray-300 dark:border-gray-800 text-sm focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
          />
        </div>
      </div>

      {/* --- Tabel --- */}
      <div className="overflow-auto rounded border border-gray-300 dark:border-gray-800">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 dark:bg-black/40 uppercase tracking-wide text-gray-600 dark:text-gray-300">
            <tr>
              <th className="px-4 py-3 font-semibold text-center">Hari & Jam</th>
              <th className="px-4 py-3 font-semibold text-center">Mata Kuliah </th>
              <th className="px-4 py-3 font-semibold text-center">Dosen</th>
              <th className="px-4 py-3 font-semibold text-center">Smt/Gol</th>
              <th className="px-4 py-3 font-semibold text-center">Ruangan</th>
              <th className="px-4 py-3 font-semibold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400 dark:text-gray-300">
                  Tidak ada jadwal ditemukan.
                </td>
              </tr>
            ) : (
              data.map((jadwal) => (
                <tr
                  key={jadwal.id}
                  className="border-t border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-black/30 hover:transition-all bg-white dark:bg-black/10"
                >
                  <td className="px-4 py-3 text-center">
                    <div className="font-semibold">{jadwal.hari}</div>
                    <div className="text-xs font-mono">
                      {jadwal.jam_mulai} - {jadwal.jam_selesai}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">{jadwal.mata_kuliah.name}</td>
                  <td className="px-4 py-3 text-center">{jadwal.dosen.name}</td>
                  <td className="px-4 py-3 text-center">
                    {jadwal.semester.name} / {jadwal.golongans.map((g) => g.name).join(", ")}
                  </td>
                  <td className="px-4 py-3  text-center">{jadwal.ruangan.name}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-4">
                      <SubmitButton
                        href={`/admin/manajemen-akademik/jadwal-kuliah/${jadwal.id}/edit`}
                        text="Edit"
                        className="bg-white w-18 dark:bg-black/50 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-[#1A1A1A] hover:transition-all text-sm border border-gray-300 dark:border-gray-800"
                      />
                      <SubmitButton
                        text="Hapus"
                        onClick={() => handleOpenModal(jadwal)}
                        className="bg-red-700 w-18 dark:bg-red-800/80 text-white dark:text-gray-200 px-4 py-2 rounded-md hover:bg-red-800 dark:hover:bg-red-950 hover:transition-all text-sm border-none"
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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

      {/* Modal Konfirmasi Hapus */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-black/80 dark:backdrop-blur-sm rounded-lg p-6 w-full max-w-lg mx-4 shadow-[0_0_30px_2px_#C10007] dark:shadow-[0_0_34px_4px_#460809]">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <LuCircleAlert className="w-6 h-6 text-red-600" />
              Konfirmasi Hapus
            </h2>
            <div className="flex flex-col gap-2">
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                Apakah Anda yakin ingin menghapus jadwal :
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 font-bold">
                {selectedJadwal?.mata_kuliah.name} - {selectedJadwal?.semester.name} -{" "}
                {selectedJadwal?.prodi.name} - Golongan{" "}
                {selectedJadwal?.golongans.map((g) => g.name).join(", ")}
              </p>
              <p className=" text-sm text-gray-600 dark:text-gray-300">
                Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

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
    </div>
  );
}
