"use client";

import { SubmitButton } from "@/components/auth/SubmitButton";
import { useRouter, useSearchParams } from "next/navigation";
import { ChangeEvent } from "react";

interface MahasiswaData {
  id: string;
  nim?: string | null;
  name: string;
  prodi?: { name: string } | null;
  semester?: { name: string } | null;
  golongan?: { name: string } | null;
}

interface FilterOption {
  id: string | number;
  name: string;
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
}: {
  data: MahasiswaData[];
  filters: {
    semesters: FilterOption[];
    prodis: FilterOption[];
    golongans: FilterOption[];
    current: FilterState;
  };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`?${params.toString()}`);
  };

  const displayValue = (val?: string | null) => (val && val.trim() !== "" ? val : "-");

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <select
          className="bg-white dark:bg-black/50 text-black dark:text-gray-200 border border-gray-300 dark:border-gray-800 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500/20 dark:focus:ring-slate-400/20 text-sm placeholder-gray-700/50 dark:placeholder-gray-500/50"
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
          className="bg-white dark:bg-black/20 text-black dark:text-gray-200 border border-gray-300 dark:border-gray-800 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500/20 dark:focus:ring-slate-400/20 text-sm placeholder-gray-700/50 dark:placeholder-gray-500/50"
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
          className="bg-white dark:bg-black/20 text-black dark:text-gray-200 border border-gray-300 dark:border-gray-800 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500/20 dark:focus:ring-slate-400/20 text-sm placeholder-gray-700/50 dark:placeholder-gray-500/50"
          value={filters.current.golongan || ""}
          onChange={(e) => updateFilter("golongan", e.target.value)}
        >
          <option value="" className="bg-white dark:bg-black/90">
            Semua Golongan
          </option>
          {filters.golongans.map((g) => (
            <option key={g.id} value={g.id} className="bg-white dark:bg-black/90">
              {g.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Cari NIM..."
          className="bg-white dark:bg-black/20 text-black dark:text-gray-200 border border-gray-300 dark:border-gray-800 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500/20 dark:focus:ring-slate-400/20 text-sm placeholder-gray-700/50 dark:placeholder-gray-500/50"
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
                      className="bg-white w-18 dark:bg-black/50 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-[#1A1A1A] hover:transition-all text-sm border border-gray-300 dark:border-gray-800 flex items-center justify-center gap-2 cursor-pointer"
                    />
                    <SubmitButton
                      text="Hapus"
                      className="bg-red-700/80 w-18 dark:bg-red-800/80 text-white dark:text-gray-200 px-4 py-2 rounded-md hover:bg-red-700 dark:hover:bg-red-950 hover:transition-all text-sm border-none flex items-center justify-center gap-2 cursor-pointer"
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
}
