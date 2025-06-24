"use client";

import { JSX, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  LuCheck,
  LuX,
  LuLoader,
  LuUserX,
  LuCalendarX,
  LuUserCheck,
  LuClock,
  LuCircleCheck,
} from "react-icons/lu";
import { Skeleton } from "@/components/ui/skeleton";
import { User2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TbLoader3 } from "react-icons/tb";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";

// Tipe data yang lebih spesifik
type StatusKey = "waiting" | "success" | "user_not_found" | "already_scanned" | "no_schedule" | "error";
type PresensiPayload = {
  mahasiswa: {
    name: string;
    nim: string;
    foto?: string;
    prodi?: { name: string };
    semester?: { name: string };
    golongan?: { name: string };
  };
  jadwal?: {
    mata_kuliah: { name: string };
    dosen: { name: string };
    jam_mulai: string;
    jam_selesai: string;
    ruangan: { name: string };
  };
  presensi?: {
    status: "HADIR" | "TERLAMBAT";
    waktu_presensi: string;
  };
  error?: string;
  reason?: StatusKey;
};

const getStatusProps = (status: StatusKey, data: PresensiPayload | null) => {
  const time = data?.presensi ? format(parseISO(data.presensi.waktu_presensi), "HH:mm:ss") : "";
  switch (status) {
    case "success":
      const presensiStatus = data?.presensi?.status;
      if (presensiStatus === "TERLAMBAT") {
        return {
          class:
            "bg-emerald-200/40 dark:bg-emerald-800/30 border-emerald-400 dark:border-emerald-800 text-emerald-800 dark:text-emerald-100 shadow-[0_0_40px_1px] shadow-emerald-800/50 dark:shadow-emerald-800/50",
          title: "Presensi Terlambat",
          glow: "shadow-amber-500/30",
          icon: <LuClock className="h-16 w-16 text-amber-500" />,
          message: `Tercatat pukul ${time}`,
        };
      }
      return {
        class:
          "bg-emerald-200/40 dark:bg-emerald-800/30 border-emerald-400 dark:border-emerald-800 text-emerald-800 dark:text-emerald-100 shadow-[0_0_40px_1px] shadow-emerald-800/50 dark:shadow-emerald-800/50",
        title: "Presensi Berhasil",
        glow: "shadow-green-500/30",
        icon: <LuCircleCheck className="h-16 w-16 text-green-500" />,
        message: `Tercatat pukul ${time}`,
      };

    case "no_schedule": {
      return {
        class:
          "bg-neutral-200 dark:bg-neutral-600 border-gray-400 dark:border-neutral-700 text-gray-800 dark:text-neutral-200 shadow-[0_0_80px_1px] shadow-neutral-400 dark:shadow-neutral-800",
        title: "Presensi Gagal",
        glow: "shadow-red-500/30",
        icon: <LuX className="h-16 w-16 text-red-500" />,
        message: "Tidak ada jadwal presensi untuk hari ini.",
      };
    }

    case "user_not_found":
      return {
        class:
          "bg-amber-200 dark:bg-amber-700 border-yellow-200 dark:border-amber-700 text-yellow-800 dark:text-white shadow-[0_0_40px_1px] shadow-yellow-300/70 dark:shadow-amber-800/70",
        title: "Presensi Gagal",
        glow: "shadow-red-500/30",
        icon: <LuUserX className="h-16 w-16 text-red-500" />,
        message: data?.error,
      };

    case "error":
      return {
        class:
          "bg-red-200/40 dark:bg-red-800/30 border-red-400 dark:border-red-800 text-red-800 dark:text-red-100 shadow-[0_0_40px_1px] shadow-red-800/50 dark:shadow-red-800/50",
        icon: <LuX className="h-12 w-12" />,
        title: "Presensi Gagal",
        message: data?.error,
      };

    case "already_scanned":
      return {
        class: "bg-blue-200/30 border-blue-400 text-blue-800 shadow-blue-500/30",
        title: "Sudah Presensi",
        glow: "shadow-blue-500/30",
        icon: <LuUserCheck className="h-16 w-16" />,
        message: data?.error,
      };

    default:
      return {
        class:
          "bg-sky-200/40 dark:bg-sky-800/30 border-sky-400 dark:border-sky-800 text-sky-800 dark:text-sky-100 shadow-[0_0_40px_1px] shadow-sky-800/50 dark:shadow-sky-800/50",
        title: "Menunggu Presensi...",
        glow: "shadow-sky-500/20",
        icon: <TbLoader3 className="w-16 h-16 text-sky-500 animate-spin" />,
        message: "Silakan lakukan presensi dengan kartu RFID Anda.",
      };
  }
};

function HistoryItem({ item, index }: { item: PresensiPayload; index: number }) {
  const isSuccess = item.presensi?.status;
  const presensiTime = item.presensi ? format(parseISO(item.presensi.waktu_presensi), "HH:mm:ss") : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="flex items-center justify-between p-3 bg-white dark:bg-black/20 rounded-lg border dark:border-gray-800"
    >
      <div className="flex items-center gap-4">
        {item?.mahasiswa?.foto ? (
          <Image
            src={item.mahasiswa.foto}
            alt={item.mahasiswa.name}
            width={40}
            height={40}
            className="rounded-full object-cover w-10 h-10"
          />
        ) : (
          <div className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-muted dark:border-neutral-400 bg-muted/50 text-muted-foreground">
            <User2 className="w-8 h-8" />
          </div>
        )}
        <div>
          <p className="font-semibold">{item.mahasiswa.name}</p>
          <p className="text-xs text-muted-foreground">{item.mahasiswa.nim}</p>
        </div>
      </div>
      <div className="text-right">
        <Badge
          className={`font-semibold text-sm bg-neutral-100 dark:bg-neutral-900 ${
            isSuccess ? "text-emerald-500 dark:text-emerald-600/80" : "text-red-500 dark:text-red-600/80"
          }`}
        >
          {isSuccess ? `Presensi ${item.presensi?.status}` : item.error || "Gagal"}
        </Badge>
        <p className="text-xs text-muted-foreground">{presensiTime}</p>
      </div>
    </motion.div>
  );
}

export default function MonitoringClient() {
  const [data, setData] = useState<PresensiPayload | null>(null);
  const [status, setStatus] = useState<StatusKey>("waiting");
  const [history, setHistory] = useState<PresensiPayload[]>([]);
  const [isImageLoading, setIsImageLoading] = useState(true);
  useEffect(() => {
    console.log("Foto Mahasiswa:", data?.mahasiswa?.foto);
  }, [data]);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3001");
    socket.onopen = () => console.log("Monitoring UI terhubung.");
    socket.onclose = () => console.log("Monitoring UI terputus.");
    socket.onerror = (err) => console.error("Error WebSocket:", err);

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (!message?.event || !message?.data) return;

        const payload = message;

        setIsImageLoading(true);
        setData(payload.data);
        setHistory((prev) => [payload.data, ...prev.slice(0, 4)]);

        if (payload.event === "presensi-sukses") {
          setStatus("success");
        } else if (payload.event === "presensi-gagal") {
          setStatus((payload.data?.reason?.toLowerCase() as StatusKey) || "error");
        }
      } catch (e) {
        console.error("Gagal parsing pesan WebSocket:", e);
      }
    };

    return () => socket.close();
  }, []);

  // PERBAIKAN 1: Objek konfigurasi menggunakan kunci huruf kecil
  const currentStatus = useMemo(() => getStatusProps(status, data), [status, data]);

  const displayedData = useMemo(() => {
    if (status === "waiting") {
      return {
        mahasiswa: {
          name: "Menunggu Presensi",
          nim: "--------",
          foto: "",
          prodi: { name: "-" },
          semester: { name: "-" },
          golongan: { name: "-" },
        },
        jadwal: undefined,
        presensi: undefined,
      } as PresensiPayload;
    }
    return data;
  }, [status, data]);

  return (
    <div className="min-h-screen p-4 bg-white dark:bg-black text-foreground flex flex-col items-center">
      {/* Card Utama */}
      <AnimatePresence mode="wait">
        <motion.div
          key={status + (data?.mahasiswa?.nim || "waiting")}
          initial={{ opacity: 0, scale: 0.98, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1, y: 20 }}
          transition={{ duration: 0.2, ease: "circInOut" }}
          className={cn(
            "w-full max-w-6xl rounded-3xl p-8 relative overflow-hidden border shadow-2xl transition-all duration-700 mt-12",
            currentStatus.class
          )}
        >
          {data || status === "waiting" ? (
            <>
              <div
                className={cn("absolute -inset-2 rounded-3xl blur-xl transition-all", currentStatus.class)}
              />
              <div className="relative z-10 grid md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center text-center">
                  <div className="relative">
                    <div className="relative w-36 h-36 rounded-full overflow-hidden">
                      {/* Status WAITING → Tampilkan loader */}
                      {status === "waiting" ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <TbLoader3 className="w-20 h-20 animate-spin" />
                        </div>
                      ) : (
                        <>
                          {/* Skeleton saat loading */}
                          {isImageLoading && (
                            <Skeleton className="absolute inset-0 w-full h-full rounded-full z-0" />
                          )}

                          {/* Foto jika ada */}
                          {displayedData?.mahasiswa?.foto ? (
                            <Image
                              key={displayedData.mahasiswa.nim}
                              src={displayedData.mahasiswa.foto}
                              alt="Foto Mahasiswa"
                              width={144}
                              height={144}
                              onLoadingComplete={() => setIsImageLoading(false)}
                              onError={() => setIsImageLoading(false)}
                              className={cn(
                                "rounded-full w-full h-full object-cover border-4 border-muted dark:border-neutral-700 shadow-lg z-10",
                                isImageLoading && "opacity-0"
                              )}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center rounded-full border-4 border-muted dark:border-neutral-400 bg-muted/50 text-muted-foreground z-10">
                              <User2 className="w-16 h-16" />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    {status !== "waiting" && (
                      <div
                        className={cn(
                          "absolute bottom-2 right-2 h-6 w-6 rounded-full flex items-center justify-center border-2",
                          status === "success" && "bg-emerald-500",
                          (status === "user_not_found" || status === "error" || status === "no_schedule") &&
                            "bg-red-500",
                          status === "already_scanned" && "bg-blue-500"
                        )}
                      >
                        {status === "success" ? (
                          <LuCheck className="text-white text-xs" />
                        ) : (
                          <LuX className="text-white text-xs" />
                        )}
                      </div>
                    )}
                  </div>
                  <h2 className="mt-4 text-xl font-bold">
                    {displayedData?.mahasiswa?.name || "Menunggu Presensi"}
                  </h2>
                  <p className="text-neutral-600 dark:text-neutral-300 font-mono">
                    {displayedData?.mahasiswa?.nim || "--------"}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2 justify-center text-xs">
                    <Badge variant="outline">{displayedData?.mahasiswa?.semester?.name || "-"}</Badge>
                    <Badge variant="outline">{displayedData?.mahasiswa?.prodi?.name || "-"}</Badge>
                    <Badge variant="outline">
                      Golongan {displayedData?.mahasiswa?.golongan?.name || "-"}
                    </Badge>
                  </div>
                </div>

                {/* Status */}
                <div className="md:col-span-2 space-y-4">
                  <div className="p-4 rounded-xl border shadow-sm bg-white dark:bg-muted/40">
                    <h3 className="text-2xl font-black uppercase tracking-tight">{currentStatus.title}</h3>
                    <p className="text-neutral-600 dark:text-neutral-300 mt-2">{currentStatus.message}</p>
                  </div>
                  {/* Info jadwal */}
                  <div>
                    <p className="text-sm font-semibold text-blue-500 uppercase tracking-wider mb-1">
                      Mata Kuliah Saat Ini
                    </p>
                    <h4 className="text-xl font-bold">
                      {displayedData?.jadwal?.mata_kuliah?.name || "Tidak Ada Jadwal"}
                    </h4>
                    <div className="text-neutral-600 dark:text-neutral-300 text-sm mt-1 space-y-1">
                      <p>
                        Jam:{" "}
                        {displayedData?.jadwal
                          ? `${displayedData.jadwal.jam_mulai} - ${displayedData.jadwal.jam_selesai}`
                          : "--:--"}
                      </p>
                      <p>Ruangan: {displayedData?.jadwal?.ruangan?.name || "-"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-6 items-center justify-center min-h-[300px]">
              {/* Tampilan awal saat menunggu */}
              <TbLoader3 className="w-12 h-12 animate-spin text-muted-foreground" />
              <p className="ml-4 text-neutral-600 dark:text-neutral-300 text-2xl font-bold">Memuat...</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Riwayat */}
      <div className="w-full max-w-6xl mt-8">
        <h3 className="text-lg font-semibold mb-3">Riwayat Terakhir</h3>
        <div className="space-y-3">
          {history.map((h, idx) => (
            <HistoryItem index={idx} key={h.mahasiswa?.nim + "-" + idx} item={h} />
          ))}
        </div>
      </div>
    </div>
  );
}
