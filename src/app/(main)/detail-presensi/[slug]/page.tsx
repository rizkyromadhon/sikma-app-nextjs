import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import DetailPresensiTable from "@/components/main/DetailPresensiTable";
import { startOfDay, endOfDay } from "date-fns";

export default async function DetailPresensiPage({ params, searchParams }: any) {
  const { slug } = await params;
  const { semester, mataKuliah, ruangan, golongan } = await searchParams;
  const semesterId = semester !== "all" ? semester : undefined;
  const mataKuliahId = mataKuliah !== "all" ? mataKuliah : undefined;
  const ruanganId = ruangan !== "all" ? ruangan : undefined;
  const golonganId = golongan !== "all" ? golongan : undefined;
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
      select: {
        id: true,
        name: true,
        semesterId: true,
      },
    }),
  ]);

  const presensiData = await prisma.presensiKuliah.findMany({
    where: {
      jadwal_kuliah: {
        prodiId: prodi.id,
        ...(semesterId && { semesterId: semesterId }),
        ...(ruanganId && { ruanganId: ruanganId }),
        ...(mataKuliahId && { matkulId: mataKuliahId }),
      },
      status: {
        in: ["HADIR", "TERLAMBAT"],
      },
      waktu_presensi: {
        gte: todayStart,
        lte: todayEnd,
      },
      mahasiswa: {
        ...(semesterId && { semesterId: semesterId }),
        ...(golonganId && { golonganId: golonganId }),
      },
    },
    include: {
      mahasiswa: { include: { golongan: true, semester: true } },
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
