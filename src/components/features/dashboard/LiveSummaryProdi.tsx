// src/features/dashboard/components/LiveSummaryProdi.tsx
// 1. Pastikan Anda sudah menginstal react-icons: npm install react-icons

import Link from "next/link";
import { LuUsers, LuUserX } from "react-icons/lu";

interface LiveSummaryProdiProps {
  slug: string;
  name: string;
  hadir: number;
  tidakHadir: number;
}

export default function LiveSummaryProdi({ slug, name, hadir, tidakHadir }: LiveSummaryProdiProps) {
  return (
    <div className="relative mt-2 group">
      <div className="absolute inset-px rounded-lg bg-white dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 ring-1 shadow-sm ring-black/5 dark:ring-white/10 lg:rounded-lg hover:transition-all group-hover:ring-gray-400 dark:group-hover:ring-gray-600"></div>

      <Link
        href={`/detail-presensi/${slug}`}
        className="relative flex items-center justify-start gap-x-4 px-4 md:px-6 py-4"
      >
        <p className="flex-grow text-base md:text-lg font-medium tracking-tight text-gray-900 dark:text-white">
          {name}
        </p>

        {/* Kontainer untuk statistik */}
        <div className="flex flex-shrink-0 items-center gap-4 md:gap-6">
          {/* Statistik Hadir */}
          <div className="flex items-center gap-2">
            <LuUsers className="size-6 flex-shrink-0 text-gray-500 dark:text-gray-400" />
            <div className="w-8 text-left">
              <p className="text-base font-medium text-gray-700 dark:text-gray-300">{hadir}</p>
            </div>
          </div>

          {/* Statistik Tidak Hadir */}
          <div className="flex items-center gap-2">
            <LuUserX className="size-6 flex-shrink-0 text-red-500" />
            <div className="w-8 text-left">
              <p className="text-base font-medium text-gray-700 dark:text-gray-300">{tidakHadir}</p>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
