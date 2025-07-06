import prisma from "@/lib/prisma";
import LiveFeed from "@/components/features/dashboard/LiveFeed";
import LiveSummary from "@/components/features/dashboard/LiveSummary";
import { startOfDay, endOfDay } from "date-fns";

async function getDashboardData() {
  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());
  const latestAttendances = await prisma.presensiKuliah.findMany({
    take: 5,
    where: {
      status: "HADIR",
      waktu_presensi: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
    orderBy: { waktu_presensi: "desc" },
    include: {
      mahasiswa: { select: { name: true, foto: true } },
      mata_kuliah: { select: { name: true } },
      jadwal_kuliah: { select: { ruangan: { select: { name: true } } } },
    },
  });

  const allProdi = await prisma.programStudi.findMany({
    where: { slug: { not: null } },
    include: {
      users: {
        where: {
          role: "MAHASISWA",
        },
        select: { id: true },
      },
    },
  });

  const presensiHariIni = await prisma.presensiKuliah.findMany({
    where: {
      status: "HADIR",
      waktu_presensi: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
    select: {
      mahasiswa: {
        select: {
          id: true,
          prodi: {
            select: { slug: true, name: true },
          },
        },
      },
    },
  });

  const hadirSetPerProdi: Record<string, Set<string>> = {};

  presensiHariIni.forEach(({ mahasiswa }) => {
    const slug = mahasiswa?.prodi?.slug;
    const id = mahasiswa?.id;
    if (!slug || !id) return;

    if (!hadirSetPerProdi[slug]) {
      hadirSetPerProdi[slug] = new Set();
    }

    hadirSetPerProdi[slug].add(id);
  });

  const rekapPerProdi = allProdi
    .filter((prodi) => prodi.slug !== null)
    .map((prodi) => {
      const slug = prodi.slug!;
      const total = prodi.users.length;
      const hadir = hadirSetPerProdi[slug]?.size || 0;
      const tidakHadir = total - hadir;

      return {
        slug,
        name: prodi.name,
        hadir,
        tidakHadir,
      };
    });

  const totalHadir = rekapPerProdi.reduce((acc, p) => acc + p.hadir, 0);
  const totalTidakHadir = rekapPerProdi.reduce((acc, p) => acc + p.tidakHadir, 0);

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
    <div className="bg-white dark:bg-neutral-900/60 py-2 sm:py-4 rounded-md min-h-[92dvh] relative">
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
