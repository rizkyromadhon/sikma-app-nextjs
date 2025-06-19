import { prisma } from "@/lib/prisma";
import LiveFeed from "@/components/features/dashboard/LiveFeed";
import LiveSummary from "@/components/features/dashboard/LiveSummary";

async function getDashboardData() {
  const latestAttendances = await prisma.presensiKuliah.findMany({
    take: 5,
    orderBy: { waktu_presensi: "desc" },
    include: {
      mahasiswa: { select: { name: true, foto: true } },
      mata_kuliah: { select: { name: true } },
    },
  });
  const rekapPerProdi = [
    { slug: "teknik-komputer", nama: "Teknik Komputer", hadir: 25, tidakHadir: 10 },
    { slug: "teknik-informatika", nama: "Teknik Informatika", hadir: 30, tidakHadir: 5 },
    { slug: "manajemen-informatika", nama: "Manajemen Informatika", hadir: 22, tidakHadir: 8 },
    { slug: "bisnis-digital", nama: "Bisnis Digital", hadir: 40, tidakHadir: 3 },
  ];

  const totalHadir = rekapPerProdi.reduce((acc, curr) => acc + curr.hadir, 0);
  const totalTidakHadir = rekapPerProdi.reduce((acc, curr) => acc + curr.tidakHadir, 0);

  return {
    latestAttendances: JSON.parse(JSON.stringify(latestAttendances)),
    rekapPerProdi,
    totalHadir,
    totalTidakHadir,
  };
}

export default async function HomePage() {
  const { latestAttendances, rekapPerProdi, totalHadir, totalTidakHadir } = await getDashboardData();

  return (
    <div className="bg-white dark:bg-black py-2 sm:py-4 rounded-md">
      <div className="mx-auto max-w-[90rem] mb-8">
        <p className="mx-auto text-center mt-6 md:mt-6 text-3xl font-semibold tracking-tight text-balance text-gray-950  dark:text-gray-100 lg:text-4xl lg:w-120">
          Sudahkah anda presensi hari ini?
        </p>
        <div className="mt-10 grid gap-4 sm:mt-12 grid-cols-1 lg:grid-cols-2 px-4 md:px-4">
          <LiveFeed initialAttendances={latestAttendances} />
          <LiveSummary
            rekapPerProdi={rekapPerProdi}
            totalHadir={totalHadir}
            totalTidakHadir={totalTidakHadir}
          />
        </div>
      </div>
    </div>
  );
}
