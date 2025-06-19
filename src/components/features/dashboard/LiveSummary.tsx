import LiveSummaryProdi from "./LiveSummaryProdi";
import { LuUsers, LuUserX } from "react-icons/lu";

interface RekapProdi {
  slug: string;
  nama: string;
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
  return (
    <div className="h-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-6 shadow-[0_0_22px_rgba(0,0,0,0.10)]">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white text-center">
        Jumlah Mahasiswa Presensi Hari Ini
      </h2>

      <div id="rekap-container" className="mt-4">
        {rekapPerProdi.map((prodi) => (
          <LiveSummaryProdi
            key={prodi.slug}
            slug={prodi.slug}
            nama={prodi.nama}
            hadir={prodi.hadir}
            tidakHadir={prodi.tidakHadir}
          />
        ))}
      </div>

      <div className="mt-6">
        <p className="text-base font-medium text-gray-900 dark:text-gray-100 text-center">
          Total Keseluruhan Presensi Hari ini
        </p>
        <div className="relative mt-3 bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex justify-center items-center space-x-8 py-3">
            <div className="flex items-center gap-2">
              <LuUsers className="size-7 text-gray-500 dark:text-gray-400" />
              <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">{totalHadir}</p>
            </div>
            <div className="flex items-center gap-2">
              <LuUserX className="size-7 text-red-500" />
              <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">{totalTidakHadir}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
