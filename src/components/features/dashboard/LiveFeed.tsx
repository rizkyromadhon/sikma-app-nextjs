"use client";

import { useState } from "react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { LuCircleUser, LuCirclePlus } from "react-icons/lu";

type Attendance = {
  id: string;
  waktu_presensi: string;
  mahasiswa: { name: string | null; foto: string | null };
  mata_kuliah: { name: string };
  ruangan: { name: string };
  jadwal_kuliah: { ruangan: { name: string } };
};

interface LiveFeedProps {
  initialAttendances: Attendance[];
}

export default function LiveFeed({ initialAttendances }: LiveFeedProps) {
  // Nantinya, state ini akan diupdate oleh Pusher
  const [attendances] = useState(initialAttendances);

  return (
    <div className="h-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-6 shadow-[0_0_22px_rgba(0,0,0,0.10)]">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
        Aktivitas Presensi Terkini
      </h2>

      <div className="space-y-1 overflow-y-auto max-h-[400px] rounded-lg bg-white dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 ring-1 shadow-sm ring-black/5 dark:ring-white/10 lg:rounded-lg">
        {attendances && attendances.length > 0 ? (
          attendances.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-3 md:p-6 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50"
            >
              <div className="h-10 w-10 flex-shrink-0 rounded-full">
                {item.mahasiswa.foto ? (
                  <Image
                    src={item.mahasiswa.foto}
                    alt={`Foto ${item.mahasiswa.name}`}
                    width={40}
                    height={40}
                    className="rounded-full w-10 h-10 object-cover"
                  />
                ) : (
                  <LuCircleUser className="h-full w-full text-gray-400" />
                )}
              </div>
              <div className="flex-1 text-sm">
                <p className="text-gray-900 dark:text-gray-100">
                  <span className="font-semibold">{item.mahasiswa.name}</span>
                  {` telah presensi di mata kuliah `}
                  <span className="font-semibold">{item.mata_kuliah.name}</span>
                  {` di `}
                  <span className="font-semibold">
                    {item.jadwal_kuliah?.ruangan?.name ?? "Tanpa Ruangan"}
                  </span>
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  {formatDistanceToNow(new Date(item.waktu_presensi), {
                    addSuffix: true,
                    locale: id,
                  })}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-[398px] text-center">
            <LuCirclePlus className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-md font-semibold text-gray-900 dark:text-white">Belum Ada Aktivitas</h3>
            <p className="mt-1 text-sm text-gray-500">Data presensi hari ini akan muncul di sini.</p>
          </div>
        )}
      </div>
    </div>
  );
}
