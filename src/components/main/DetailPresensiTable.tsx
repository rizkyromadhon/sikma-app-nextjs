"use client";

import Link from "next/link";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { LuArrowLeft } from "react-icons/lu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Presensi {
  id: string;
  waktu_presensi: string;
  mahasiswa: {
    name: string;
    nim: string;
    semester?: { name: string } | null;
    golongan?: { id: string; name: string } | null;
  };
  mata_kuliah: { name: string };
  jadwal_kuliah: {
    ruangan?: { name: string } | null;
    semester?: { name: string } | null;
  };
}

interface FilterItem {
  id: string;
  name: string;
}

interface Props {
  presensiData: Presensi[];
  prodiName: string;
  filters: {
    semesters: FilterItem[];
    ruangans: FilterItem[];
    mataKuliahs: FilterItem[];
    golongans: FilterItem[];
  };
  activeSemesterId: string | null;
}

export default function DetailPresensiTable({
  presensiData: initialData,
  prodiName,
  filters,
  activeSemesterId,
}: Props) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const [presensiData, setPresensiData] = useState<Presensi[]>(initialData);

  const currentSemester = searchParams.get("semester") || "all";
  const currentGolongan = searchParams.get("golongan") || "all";
  const currentMataKuliah = searchParams.get("mataKuliah") || "all";
  const currentRuangan = searchParams.get("ruangan") || "all";

  const isGolonganDisabled = !activeSemesterId || activeSemesterId === "all";

  const updateQuery = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    if (key === "semester" && (value === "all" || !value)) {
      params.delete("golongan");
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    if (isGolonganDisabled && currentGolongan !== "all") {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("golongan");
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [isGolonganDisabled, currentGolongan, pathname, router, searchParams]);

  const filteredGolongans = useMemo(() => {
    if (!activeSemesterId || activeSemesterId === "all") return [];

    const uniqueGolonganIds = new Set<string>();
    const tempGolongans: FilterItem[] = [];

    presensiData.forEach((presensi) => {
      const g = presensi.mahasiswa.golongan;
      if (g && !uniqueGolonganIds.has(g.id)) {
        uniqueGolonganIds.add(g.id);
        tempGolongans.push({ id: g.id, name: g.name });
      }
    });

    return tempGolongans.sort((a, b) => a.name.localeCompare(b.name));
  }, [presensiData, activeSemesterId]);

  const groupedByMahasiswa = presensiData.reduce<Record<string, Presensi[]>>((acc, item) => {
    const key = item.mahasiswa.nim;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3001");

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.event === "presensi-sukses") {
        const { mahasiswa, jadwal, presensi } = message.data;

        setPresensiData((prev) => {
          if (prev.some((p) => p.id === presensi.id)) return prev;

          return [
            ...prev,
            {
              id: presensi.id,
              waktu_presensi: presensi.waktu_presensi,
              mahasiswa: {
                name: mahasiswa.name,
                nim: mahasiswa.nim,
                semester: mahasiswa.semester,
                golongan: mahasiswa.golongan,
              },
              mata_kuliah: { name: jadwal.mata_kuliah.name },
              jadwal_kuliah: {
                ruangan: jadwal.ruangan,
                semester: jadwal.semester,
              },
            },
          ];
        });
      }
    };

    return () => socket.close();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 min-h-[92dvh]">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white mb-6"
      >
        <LuArrowLeft className="h-4 w-4" />
        Kembali
      </Link>

      <h1 className="text-xl md:text-2xl font-bold tracking-tight text-neutral-800 dark:text-neutral-200">
        Detail Presensi <span className="text-neutral-800 dark:text-neutral-200">- {prodiName}</span>
      </h1>

      <div className="flex flex-col md:flex-row items-center gap-4 mt-6">
        <Select onValueChange={(val) => updateQuery("semester", val)} value={currentSemester}>
          <SelectTrigger className="w-full md:w-44">
            <SelectValue placeholder="Semua Semester" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Semester</SelectItem>
            {filters.semesters.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          onValueChange={(val) => updateQuery("golongan", val)}
          value={currentGolongan}
          disabled={isGolonganDisabled}
        >
          <SelectTrigger className="w-full md:w-44">
            <SelectValue placeholder="Golongan" />
          </SelectTrigger>
          <SelectContent>
            {isGolonganDisabled ? (
              <SelectItem value="all">Pilih Semester Dulu</SelectItem>
            ) : (
              <SelectItem value="all">Semua Golongan</SelectItem>
            )}
            {filteredGolongans.map((g) => (
              <SelectItem key={g.id} value={g.id}>
                {g.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={(val) => updateQuery("mataKuliah", val)} value={currentMataKuliah}>
          <SelectTrigger className="w-full md:w-80">
            <SelectValue placeholder="Mata Kuliah" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Mata Kuliah</SelectItem>
            {filters.mataKuliahs.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={(val) => updateQuery("ruangan", val)} value={currentRuangan}>
          <SelectTrigger className="w-full md:w-44">
            <SelectValue placeholder="Ruangan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Ruangan</SelectItem>
            {filters.ruangans.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* TABEL */}
      <div className="mt-6 overflow-x-auto bg-white dark:bg-neutral-950/50 border border-gray-200 dark:border-neutral-800 rounded-xl shadow-md">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-800">
          <thead className="bg-gray-50 dark:bg-neutral-900">
            <tr>
              <th className="px-6 py-3 text-center text-xs font-medium text-neutral-800 dark:text-neutral-300 uppercase tracking-wider">
                Nama Mahasiswa
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-neutral-800 dark:text-neutral-300 uppercase tracking-wider">
                Semester / Gol.
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-neutral-800 dark:text-neutral-300 uppercase tracking-wider">
                Mata Kuliah
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-neutral-800 dark:text-neutral-300 uppercase tracking-wider">
                Ruangan
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-neutral-800 dark:text-neutral-300 uppercase tracking-wider">
                Waktu Presensi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-neutral-800">
            {Object.values(groupedByMahasiswa).map((presensis) => (
              <AnimatePresence key={presensis[0].mahasiswa.nim}>
                {presensis.map((presensi, index) => (
                  <motion.tr
                    key={presensi.id}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {index === 0 && (
                      <>
                        <td
                          rowSpan={presensis.length}
                          className="px-6 py-4 whitespace-nowrap text-center align-middle"
                        >
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {presensi.mahasiswa.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {presensi.mahasiswa.nim}
                          </div>
                        </td>
                        <td
                          rowSpan={presensis.length}
                          className="px-6 py-4 text-center whitespace-nowrap text-sm text-neutral-800 dark:text-neutral-300"
                        >
                          {presensi.mahasiswa?.semester?.name} / {presensi.mahasiswa?.golongan?.name}
                        </td>
                      </>
                    )}
                    <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-neutral-800 dark:text-neutral-300">
                      {presensi.mata_kuliah.name}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-neutral-800 dark:text-neutral-300">
                      {presensi.jadwal_kuliah?.ruangan?.name}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-neutral-800 dark:text-neutral-300">
                      {new Date(presensi.waktu_presensi).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            ))}
            {presensiData.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                  Belum ada data presensi.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
