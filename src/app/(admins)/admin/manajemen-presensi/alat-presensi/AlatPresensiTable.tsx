"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { LuCircleAlert } from "react-icons/lu";
import { useDebouncedCallback } from "use-debounce";
import { AlatMode, AlatStatus } from "@/generated/prisma/client";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());
type AlatPresensiData = {
  id: string;
  name: string;
  mode: AlatMode;
  status: AlatStatus;
  jadwal_nyala: string | null;
  jadwal_mati: string | null;
  ruangan: { kode: string; name: string };
};

export default function AlatPresensiTable({ initialSearch }: { initialSearch?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";

  const { data, error, isLoading } = useSWR<AlatPresensiData[]>(
    `/api/alat-presensi${search ? `?search=${search}` : ""}`,
    fetcher,
    { refreshInterval: 5000 }
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAlat, setSelectedAlat] = useState<AlatPresensiData | null>(null);
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
    router.replace(`?${params.toString()}`);
  }, 500);

  const handleOpenModal = (alat: AlatPresensiData) => {
    setSelectedAlat(alat);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedAlat) return;
    setIsLoadingDelete(true);
    try {
      const response = await fetch(`/api/alat-presensi/${selectedAlat.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Gagal menghapus alat.");
      setIsModalOpen(false);

      const params = new URLSearchParams(searchParams);
      params.set("alat_deleted", "success");
      router.replace(`?${params.toString()}`, { scroll: false });
      router.refresh();
    } catch (error) {
      if (error instanceof Error) alert(`Error: ${error.message}`);
    } finally {
      setIsLoadingDelete(false);
    }
  };

  const formatJadwal = (dateString: string | null) => {
    if (!dateString) return "-";
    return format(new Date(dateString), "HH:mm");
  };

  const getStatusColor = (status: AlatStatus) => {
    switch (status) {
      case "AKTIF":
        return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
      case "NONAKTIF":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800/80 dark:text-gray-300";
      case "ERROR":
        return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
      default:
        return "bg-gray-100";
    }
  };

  if (isLoading) return <p className="text-sm">Memuat data...</p>;
  if (error) return <p className="text-sm text-red-500">Gagal memuat data alat presensi.</p>;

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="search" className="block text-sm font-medium mb-1">
          Filter Pencarian
        </label>
        <input
          type="text"
          placeholder="Cari berdasarkan nama alat atau kode ruangan..."
          defaultValue={initialSearch}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-100 px-4 py-2 border rounded-md bg-gray-50 dark:bg-black/50 dark:text-white border-gray-300 dark:border-gray-800 text-sm focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
        />
      </div>

      <div className="overflow-auto rounded border border-gray-300 dark:border-gray-800 shadow-sm">
        <table className="min-w-full text-sm text-left text-black dark:text-gray-200">
          <thead className="bg-gray-100 dark:bg-black/40 uppercase tracking-wide">
            <tr>
              <th className="px-6 py-3 font-semibold text-center">Nama Alat</th>
              <th className="px-6 py-3 font-semibold text-center">Lokasi (Ruangan)</th>
              <th className="px-6 py-3 font-semibold text-center">Mode</th>
              <th className="px-6 py-3 font-semibold text-center">Jadwal Aktif</th>
              <th className="px-6 py-3 font-semibold text-center">Status</th>
              <th className="px-6 py-3 font-semibold text-center w-px whitespace-nowrap">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data?.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  Tidak ada alat ditemukan.
                </td>
              </tr>
            ) : (
              data?.map((alat) => (
                <tr
                  key={alat.id}
                  className="border-t dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-black/30"
                >
                  <td className="px-6 py-4 font-semibold text-center">{alat.name}</td>
                  <td className="px-6 py-4 text-center">
                    {alat.ruangan.name} ({alat.ruangan.kode})
                  </td>
                  <td className="px-6 py-4 text-center">{alat.mode}</td>
                  <td className="px-6 py-4 font-mono text-center">
                    {formatJadwal(alat.jadwal_nyala)} - {formatJadwal(alat.jadwal_mati)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(alat.status)}`}
                    >
                      {alat.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex items-center gap-4 justify-center">
                    <SubmitButton
                      text="Edit"
                      href={`/admin/manajemen-presensi/alat-presensi/${alat.id}/edit`}
                      className="bg-white w-18 dark:bg-black/50 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-[#1A1A1A] hover:transition-all text-sm border border-gray-300 dark:border-gray-800"
                    />
                    <SubmitButton
                      text="Hapus"
                      onClick={() => handleOpenModal(alat)}
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
          <div className="bg-white dark:bg-black/80 dark:backdrop-blur-sm rounded-lg p-6 w-full max-w-lg mx-4 shadow-[0_0_30px_2px_#C10007] dark:shadow-[0_0_34px_4px_#460809]">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <LuCircleAlert className="w-6 h-6 text-red-600" />
              Konfirmasi Hapus
            </h2>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
              Apakah Anda yakin ingin menghapus :
            </p>
            <p className="mt-1 text-sm font-bold text-gray-900 dark:text-white">{selectedAlat?.name} ?</p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Data yang telah dihapus tidak dapat dikembalikan.
            </p>
            <div className="mt-6 flex justify-end gap-4">
              <SubmitButton
                text="Batal"
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-200 dark:bg-black dark:border dark:border-gray-800 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md text-sm hover:bg-gray-300 dark:hover:bg-slate-800 transition-all"
              />
              <SubmitButton
                text="Ya, Hapus"
                isLoading={isLoadingDelete}
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
