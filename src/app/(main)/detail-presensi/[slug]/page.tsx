import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import DetailPresensiTable from "@/components/main/DetailPresensiTable";
import { startOfDay, endOfDay } from "date-fns";

export default async function DetailPresensiPage({ params, searchParams }: any) {
  const { slug } = params;
  const semesterId = searchParams?.semester !== "all" ? searchParams.semester : undefined;
  const mataKuliahId = searchParams?.mataKuliah !== "all" ? searchParams.mataKuliah : undefined;
  const ruanganId = searchParams?.ruangan !== "all" ? searchParams.ruangan : undefined;
  const golonganId = searchParams?.golongan !== "all" ? searchParams.golongan : undefined;
  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());

  const prodi = await prisma.programStudi.findUnique({
    where: { slug },
  });
  if (!prodi) notFound();

  const [semesters, ruangans, mataKuliahs, golongans] = await Promise.all([
    prisma.semester.findMany(),
    prisma.ruangan.findMany(),
    prisma.mataKuliah.findMany(),
    prisma.golongan.findMany({
      where: semesterId
        ? {
            semesterId: semesterId,
            prodiId: prodi.id,
          }
        : {
            prodiId: prodi.id,
          },
    }),
  ]);

  const presensiData = await prisma.presensiKuliah.findMany({
    where: {
      jadwal_kuliah: {
        prodiId: prodi.id,
        ...(semesterId && { semesterId: semesterId }),
        ...(ruanganId && { ruanganId: ruanganId }),
      },
      waktu_presensi: {
        gte: todayStart,
        lte: todayEnd,
      },
      mahasiswa: {
        ...(semesterId && { semesterId: semesterId }),
        ...(golonganId && { golonganId: golonganId }),
      },
      ...(mataKuliahId && { mataKuliahId: mataKuliahId }),
    },
    include: {
      mahasiswa: { include: { golongan: true, semester: true } }, // Pastikan golongan di-include
      mata_kuliah: true,
      jadwal_kuliah: {
        include: { ruangan: true, semester: true },
      },
    },
    orderBy: {
      waktu_presensi: "desc",
    },
  });

  return (
    <DetailPresensiTable
      presensiData={JSON.parse(JSON.stringify(presensiData))}
      prodiName={prodi.name}
      filters={{ semesters, ruangans, mataKuliahs, golongans }}
      activeSemesterId={semesterId || null}
    />
  );
}
