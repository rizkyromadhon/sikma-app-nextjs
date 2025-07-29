"use client";

import { useEffect, useState } from "react";
import { LuUsers, LuUserX } from "react-icons/lu";
import LiveSummaryProdi from "./LiveSummaryProdi";

interface RekapProdi {
  slug: string;
  name: string;
  hadir: number;
  tidakHadir: number;
}

interface SummaryPresenceProps {
  rekapPerProdi: RekapProdi[];
  totalHadir: number;
  totalTidakHadir: number;
}

export default function SummaryPresence({
  rekapPerProdi,
  totalHadir,
  totalTidakHadir,
}: SummaryPresenceProps) {
  const [rekap, setRekap] = useState(rekapPerProdi);
  const [hadir, setHadir] = useState(totalHadir);
  const [tidakHadir, setTidakHadir] = useState(totalTidakHadir);

  useEffect(() => {
    const socket = new WebSocket("wss://sikma-websocket-server.onrender.com");

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("📡 Pesan masuk:", message);

      if (message.event === "presensi-sukses") {
        const slug = message.data.mahasiswa?.prodi?.slug;
        if (!slug) return;

        setRekap((prev) =>
          prev.map((p) => (p.slug === slug ? { ...p, hadir: p.hadir + 1, tidakHadir: p.tidakHadir - 1 } : p))
        );
        setHadir((prev) => prev + 1);
        setTidakHadir((prev) => prev - 1);
      }
    };

    return () => socket.close();
  }, []);

  return (
    <div className="h-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950/50 p-6 shadow-[0_0_22px_rgba(0,0,0,0.10)]">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white text-center">
        Jumlah Mahasiswa Presensi Hari Ini
      </h2>

      <div id="rekap-container" className="mt-4">
        {rekap.map((prodi) => (
          <LiveSummaryProdi
            key={prodi.slug}
            slug={prodi.slug}
            name={prodi.name}
            hadir={prodi.hadir}
            tidakHadir={prodi.tidakHadir}
          />
        ))}
      </div>

      <div className="mt-6">
        <p className="text-base font-medium text-gray-900 dark:text-gray-100 text-center">
          Total Keseluruhan Presensi Hari ini
        </p>
        <div className="relative mt-3 bg-white dark:bg-neutral-900/50 border border-neutral-300 dark:border-neutral-800 rounded-lg">
          <div className="flex justify-center items-center space-x-8 py-3">
            <div className="flex items-center gap-2">
              <LuUsers className="size-7 text-gray-500 dark:text-gray-400" />
              <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">{hadir}</p>
            </div>
            <div className="flex items-center gap-2">
              <LuUserX className="size-7 text-red-500" />
              <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">{tidakHadir}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
