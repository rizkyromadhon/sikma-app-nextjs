"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { LuCircleAlert, LuCircleArrowLeft, LuCircleArrowRight } from "react-icons/lu";
import { useRouter } from "next/navigation";

interface PesertaData {
  id: string;
  mahasiswa: {
    id: string;
    name: string;
    nim: string | null;
    semester: { id: string; name: string } | null;
    golongan: { id: string; name: string } | null;
  };
  jadwal_kuliah: {
    id: string;
    mata_kuliah: { id: string; name: string };
    ruangan: { id: string; name: string } | null;
    semester: { id: string; name: string };
    golongans: { id: string; name: string }[];
  };
}

interface FilterOption {
  id: string;
  name: string;
}
interface PesertaKuliahTableProps {
  data: PesertaData[];
  filters: {
    semesters: FilterOption[];
    mataKuliahs: FilterOption[];
    ruangans: FilterOption[];
  };
  prodiId: string;
}

export default function PesertaKuliahTable({ data, filters, prodiId }: PesertaKuliahTableProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPeserta, setSelectedPeserta] = useState<PesertaData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [golonganOptions, setGolonganOptions] = useState<FilterOption[]>([]);

  const [localFilters, setLocalFilters] = useState<{
    semester?: string;
    golongan?: string;
    matkul?: string;
    ruangan?: string;
    search?: string;
  }>({
    semester: "",
    golongan: "",
    matkul: "",
    ruangan: "",
    search: "",
  });

  const ITEMS_PER_PAGE = 6;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!localFilters.semester) {
      setGolonganOptions([]);
      return;
    }

    const fetchGolongan = async () => {
      const res = await fetch(`/api/golongan?semesterId=${localFilters.semester}&prodiId=${prodiId}`);
      const data = await res.json();
      setGolonganOptions(Array.isArray(data) ? data : []);
    };

    fetchGolongan();
  }, [localFilters.semester, prodiId]);

  const handleSearch = useDebouncedCallback((term: string) => {
    setLocalFilters((f) => ({ ...f, search: term || undefined }));
    setCurrentPage(1);
  }, 500);

  const handleOpenModal = (peserta: PesertaData) => {
    setSelectedPeserta(peserta);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPeserta(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedPeserta) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/peserta-kuliah/${selectedPeserta.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menghapus peserta.");
      }
      router.push("/admin/manajemen-akademik/peserta-kuliah?peserta-kuliah=delete_success");
      router.refresh();
      handleCloseModal();
    } catch (err) {
      if (err instanceof Error) alert(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    return data.filter((p) => {
      if (localFilters.semester && p.mahasiswa.semester?.id !== localFilters.semester) return false;
      if (localFilters.golongan && !p.jadwal_kuliah.golongans.some((g) => g.id === localFilters.golongan))
        return false;
      if (localFilters.matkul && p.jadwal_kuliah.mata_kuliah.id !== localFilters.matkul) return false;
      if (localFilters.ruangan && p.jadwal_kuliah.ruangan?.id !== localFilters.ruangan) return false;
      if (
        localFilters.search &&
        !`${p.mahasiswa.name} ${p.mahasiswa.nim}`.toLowerCase().includes(localFilters.search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [data, localFilters]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <select
          value={localFilters.semester || ""}
          onChange={(e) => {
            const selectedSemester = e.target.value || undefined;
            setLocalFilters((f) => ({
              ...f,
              semester: selectedSemester,
              golongan: undefined,
            }));
            setCurrentPage(1);
          }}
          className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-neutral-950/50 dark:text-white border-gray-300 dark:border-neutral-800 text-sm focus:outline-none"
        >
          <option value="" className="bg-white dark:bg-neutral-900">
            Semua Semester
          </option>
          {filters.semesters.map((s) => (
            <option key={s.id} value={s.id} className="bg-white dark:bg-neutral-900">
              {s.name}
            </option>
          ))}
        </select>

        <select
          value={localFilters.golongan || ""}
          onChange={(e) => {
            const selectedGolongan = e.target.value || undefined;
            setLocalFilters((f) => ({
              ...f,
              golongan: selectedGolongan,
            }));
            setCurrentPage(1);
          }}
          disabled={!localFilters.semester}
          className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-neutral-950/50 dark:text-white border-gray-300 dark:border-neutral-800 text-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          {!localFilters.semester ? (
            <option value="">Pilih semester dulu</option>
          ) : golonganOptions.length === 0 ? (
            <option value="">Tidak ada golongan</option>
          ) : (
            <>
              <option value="" className="bg-white dark:bg-neutral-900">
                Semua Golongan
              </option>
              {golonganOptions.map((g) => (
                <option key={g.id} value={g.id} className="bg-white dark:bg-neutral-900">
                  {g.name}
                </option>
              ))}
            </>
          )}
        </select>

        <select
          value={localFilters.matkul || ""}
          onChange={(e) => {
            setLocalFilters((f) => ({ ...f, matkul: e.target.value || undefined }));
            setCurrentPage(1);
          }}
          className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-neutral-950/50 dark:text-white border-gray-300 dark:border-neutral-800 text-sm focus:outline-none"
        >
          <option value="" className="bg-white dark:bg-neutral-900">
            Semua Mata Kuliah
          </option>
          {filters.mataKuliahs.map((m) => (
            <option key={m.id} value={m.id} className="bg-white dark:bg-neutral-900">
              {m.name}
            </option>
          ))}
        </select>

        <select
          value={localFilters.ruangan || ""}
          onChange={(e) => {
            setLocalFilters((f) => ({ ...f, ruangan: e.target.value || undefined }));
            setCurrentPage(1);
          }}
          className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-neutral-950/50 dark:text-white border-gray-300 dark:border-neutral-800 text-sm focus:outline-none"
        >
          <option value="" className="bg-white dark:bg-neutral-900">
            Semua Ruangan
          </option>
          {filters.ruangans.map((r) => (
            <option key={r.id} value={r.id} className="bg-white dark:bg-neutral-900">
              {r.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Cari Nama / NIM..."
          defaultValue={localFilters.search || ""}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full bg-white dark:bg-neutral-950/50 text-black dark:text-gray-200 border border-gray-300 dark:border-neutral-800 rounded-md px-4 py-2 focus:outline-none text-sm"
        />
      </div>

      {/* Table */}
      <div className="overflow-auto rounded border border-gray-300 dark:border-neutral-800">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 dark:bg-neutral-950/50 text-gray-600 dark:text-gray-300 uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 text-center">Nama Mahasiswa</th>
              <th className="px-4 py-3 text-center">NIM</th>
              <th className="px-4 py-3 text-center">Semester/Gol</th>
              <th className="px-4 py-3 text-center">Mata Kuliah</th>
              <th className="px-4 py-3 text-center">Ruangan</th>
              <th className="px-4 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400 dark:text-gray-300">
                  Tidak ada peserta ditemukan.
                </td>
              </tr>
            ) : (
              paginatedData.map((p) => (
                <tr
                  key={p.id}
                  className="border-t border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-950/40"
                >
                  <td className="px-4 py-3 text-center">{p.mahasiswa.name}</td>
                  <td className="px-4 py-3 text-center">{p.mahasiswa.nim}</td>
                  <td className="px-4 py-3 text-center">
                    {p.mahasiswa.semester?.name || "-"} / {p.mahasiswa.golongan?.name || "-"}
                  </td>
                  <td className="px-4 py-3 text-center">{p.jadwal_kuliah.mata_kuliah.name}</td>
                  <td className="px-4 py-3 text-center">{p.jadwal_kuliah.ruangan?.name || "-"}</td>
                  <td className="px-4 py-3 text-center">
                    <SubmitButton
                      text="Hapus"
                      onClick={() => handleOpenModal(p)}
                      className="bg-red-700 dark:bg-red-800/80 text-white px-4 py-2 rounded-md text-sm hover:bg-red-800 dark:hover:bg-red-950 transition-all"
                    />
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
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage <= 1}
              className={`px-3 py-1 text-sm rounded-md flex items-center gap-2 ${
                currentPage <= 1
                  ? "pointer-events-none bg-transparent border border-gray-300 dark:border-neutral-800 text-gray-400"
                  : "bg-gray-100 dark:bg-gray-200 border border-gray-300 dark:border-neutral-800 text-gray-800 hover:bg-gray-200 dark:hover:bg-gray-300"
              }`}
            >
              <LuCircleArrowLeft /> Sebelumnya
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className={`px-3 py-1 text-sm rounded-md flex items-center gap-2 ${
                currentPage >= totalPages
                  ? "pointer-events-none bg-transparent border border-gray-300 dark:border-neutral-800 text-gray-400"
                  : "bg-gray-100 dark:bg-gray-200 border border-gray-300 dark:border-neutral-800 text-gray-800 hover:bg-gray-200 dark:hover:bg-gray-300"
              }`}
            >
              Selanjutnya <LuCircleArrowRight />
            </button>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-950 rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <LuCircleAlert className="w-6 h-6 text-red-600" />
              Konfirmasi Hapus Peserta Kuliah
            </h2>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">Yakin ingin menghapus :</p>
            <p className="font-semibold text-sm mt-1 text-gray-800 dark:text-gray-100">
              {selectedPeserta?.mahasiswa.name} ({selectedPeserta?.mahasiswa.nim})
            </p>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Pada Mata Kuliah:</p>
            <p className="font-semibold text-sm mt-1 text-gray-800 dark:text-gray-100">
              {selectedPeserta?.jadwal_kuliah.mata_kuliah.name} ?
            </p>
            <div className="mt-6 flex justify-end gap-4">
              <SubmitButton
                text="Batal"
                onClick={handleCloseModal}
                className="bg-gray-100 dark:bg-neutral-900/50 border border-neutral-300 dark:border-neutral-800 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md text-sm hover:bg-gray-300 dark:hover:bg-neutral-900 transition-all"
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
