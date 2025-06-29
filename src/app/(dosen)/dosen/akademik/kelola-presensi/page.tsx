import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import KelolaPresensiTable from "./KelolaPresensiTable";
import { startOfDay, endOfDay, parseISO } from "date-fns";

interface KelolaPresensiPageProps {
  tanggal?: string;
  mataKuliahId?: string;
}

export default async function KelolaPresensiPage({
  searchParams,
}: {
  searchParams: Promise<KelolaPresensiPageProps>;
}) {
  const { tanggal, mataKuliahId } = await searchParams;
  const session = await auth();

  if (!session || !session.user || session.user.role !== "DOSEN") {
    redirect("/login?login=unauthorized");
  }

  const dosenId = session.user.id;
  const filterTanggalString = tanggal;
  const filterMataKuliahId = mataKuliahId;

  let filterDate: Date | undefined;
  if (filterTanggalString) {
    try {
      filterDate = parseISO(filterTanggalString);
    } catch (e) {
      console.error("Invalid date format in searchParams:", filterTanggalString);
      filterDate = undefined;
    }
  }

  const courses = await prisma.mataKuliah.findMany({
    where: {
      jadwal_kuliah: {
        some: {
          dosenId: dosenId,
        },
      },
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  const presensiData = await prisma.presensiKuliah.findMany({
    where: {
      jadwal_kuliah: {
        is: {
          dosenId: dosenId,
          ...(filterMataKuliahId &&
            filterMataKuliahId !== "all" && {
              matkulId: filterMataKuliahId,
            }),
        },
      },
      ...(filterDate && {
        waktu_presensi: {
          gte: startOfDay(filterDate),
          lte: endOfDay(filterDate),
        },
      }),
    },
    include: {
      mahasiswa: {
        include: {
          golongan: true,
        },
      },
      mata_kuliah: true,
      jadwal_kuliah: {
        include: {
          ruangan: true,
          mata_kuliah: true,
        },
      },
    },
    orderBy: {
      waktu_presensi: "asc",
    },
  });

  console.log(`Fetched ${presensiData.length} presensi records for dosen: ${dosenId}`);

  return (
    <KelolaPresensiTable
      presensiData={JSON.parse(JSON.stringify(presensiData))}
      courses={courses}
      activeDate={filterTanggalString}
      activeCourseId={filterMataKuliahId}
    />
  );
}
