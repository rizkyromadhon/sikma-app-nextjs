"use client";

import Link from "next/link";
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
    semester?: { id: string; name: string } | null;
    golongan?: { id: string; name: string } | null;
  };
  mata_kuliah: { id: string; name: string };
  jadwal_kuliah: {
    ruangan?: { id: string; name: string } | null;
    semester?: { id: string; name: string } | null;
  };
}

interface FilterItem {
  id: string;
  name: string;
  semesterId?: string;
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
  const [presensiData, setPresensiData] = useState<Presensi[]>(initialData);

  useEffect(() => {
    setPresensiData(initialData);
  }, [initialData]);

  const [currentSemester, setCurrentSemester] = useState<string>("all");
  const [currentGolongan, setCurrentGolongan] = useState<string>("all");
  const [currentMataKuliah, setCurrentMataKuliah] = useState<string>("all");
  const [currentRuangan, setCurrentRuangan] = useState<string>("all");

  useEffect(() => {
    setCurrentGolongan("all");
  }, [currentSemester]);

  const isGolonganDisabled = !currentSemester || currentSemester === "all";

  const filteredPresensi = useMemo(() => {
    return presensiData.filter((p) => {
      if (currentSemester !== "all" && p.mahasiswa.semester?.id !== currentSemester) return false;
      if (currentGolongan !== "all" && p.mahasiswa.golongan?.id !== currentGolongan) return false;
      if (currentMataKuliah !== "all" && p.mata_kuliah.id !== currentMataKuliah) return false;
      if (currentRuangan !== "all" && p.jadwal_kuliah.ruangan?.id !== currentRuangan) return false;
      return true;
    });
  }, [presensiData, currentSemester, currentGolongan, currentMataKuliah, currentRuangan]);

  console.log(currentGolongan, currentSemester, currentMataKuliah, currentRuangan);

  const golongansToDisplay = useMemo(() => {
    if (!currentSemester || currentSemester === "all") {
      return [];
    }
    return filters.golongans.filter((g) => g.semesterId === currentSemester);
  }, [filters.golongans, currentSemester]);

  const groupedByMahasiswa = useMemo(() => {
    const acc: Record<string, Presensi[]> = {};
    filteredPresensi.forEach((item) => {
      const key = item.mahasiswa.nim;
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
    });
    return acc;
  }, [filteredPresensi]);

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
                semester: mahasiswa.semester
                  ? { id: mahasiswa.semester.id, name: mahasiswa.semester.name }
                  : null,
                golongan: mahasiswa.golongan
                  ? { id: mahasiswa.golongan.id, name: mahasiswa.golongan.name }
                  : null,
              },
              mata_kuliah: { id: jadwal.mata_kuliah.id, name: jadwal.mata_kuliah.name },
              jadwal_kuliah: {
                ruangan: jadwal.ruangan ? { id: jadwal.ruangan.id, name: jadwal.ruangan.name } : null,
                semester: jadwal.semester ? { id: jadwal.semester.id, name: jadwal.semester.name } : null,
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
        <Select onValueChange={(val) => setCurrentSemester(val)} value={currentSemester}>
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
          onValueChange={(val) => setCurrentGolongan(val)}
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
              <>
                <SelectItem value="all">Semua Golongan</SelectItem>
                {golongansToDisplay.length === 0 && activeSemesterId && activeSemesterId !== "all" ? (
                  <SelectItem value="no_options" disabled>
                    Tidak ada Golongan
                  </SelectItem>
                ) : (
                  golongansToDisplay.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name}
                    </SelectItem>
                  ))
                )}
              </>
            )}
          </SelectContent>
        </Select>

        <Select onValueChange={(val) => setCurrentMataKuliah(val)} value={currentMataKuliah}>
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

        <Select onValueChange={(val) => setCurrentRuangan(val)} value={currentRuangan}>
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
