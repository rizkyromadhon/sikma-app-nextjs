import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { Hari } from "@/generated/prisma/client";

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "DOSEN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dosenId = session.user.id;

  const today = new Date();
  const dayOfWeekString = format(today, "iiii").toUpperCase();
  console.log(dayOfWeekString);

  let todayPrismaDay: Hari;
  switch (dayOfWeekString) {
    case "MONDAY":
      todayPrismaDay = Hari.SENIN;
      break;
    case "TUESDAY":
      todayPrismaDay = Hari.SELASA;
      break;
    case "WEDNESDAY":
      todayPrismaDay = Hari.RABU;
      break;
    case "THURSDAY":
      todayPrismaDay = Hari.KAMIS;
      break;
    case "FRIDAY":
      todayPrismaDay = Hari.JUMAT;
      break;
    case "SATURDAY":
      todayPrismaDay = Hari.SABTU;
      break;
    case "SUNDAY":
      todayPrismaDay = Hari.MINGGU;
      break;
    default:
      console.warn(`Unknown day of week: ${dayOfWeekString}. Defaulting to SENIN.`);
      todayPrismaDay = Hari.SENIN;
  }

  try {
    const [kelasHariIniCount, totalMataKuliah, jadwalList, jamMengajarPerMinggu] = await Promise.all([
      prisma.jadwalKuliah.count({
        where: {
          dosenId: dosenId,
          hari: todayPrismaDay,
        },
      }),

      prisma.mataKuliah.count({
        where: {
          jadwal_kuliah: {
            some: { dosenId },
          },
        },
      }),

      prisma.jadwalKuliah.findMany({
        where: { dosenId },
        select: {
          semesterId: true,
          prodiId: true,
          golongans: { select: { id: true } },
        },
      }),

      prisma.jadwalKuliah
        .findMany({
          where: { dosenId },
          select: { jam_mulai: true, jam_selesai: true },
        })
        .then((schedules) => {
          let totalMinutes = 0;
          schedules.forEach((schedule) => {
            const [startHour, startMinute] = schedule.jam_mulai.split(":").map(Number);
            const [endHour, endMinute] = schedule.jam_selesai.split(":").map(Number);
            const startTime = startHour * 60 + startMinute;
            const endTime = endHour * 60 + endMinute;
            totalMinutes += endTime >= startTime ? endTime - startTime : endTime + 24 * 60 - startTime;
          });
          return Math.round(totalMinutes / 60);
        }),
    ]);

    const mahasiswaSet = new Set<string>();

    for (const jadwal of jadwalList) {
      const mahasiswa = await prisma.user.findMany({
        where: {
          role: "MAHASISWA",
          prodiId: jadwal.prodiId,
          semesterId: jadwal.semesterId,
          golonganId: { in: jadwal.golongans.map((g) => g.id) },
        },
        select: { id: true },
      });

      mahasiswa.forEach((m) => mahasiswaSet.add(m.id));
    }

    const totalMahasiswaUnik = mahasiswaSet.size;

    return NextResponse.json(
      {
        kelasHariIniCount,
        totalMataKuliah,
        totalMahasiswaUnik,
        jamMengajarPerMinggu,
        dosenName: session.user.name,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    return NextResponse.json({ error: "Gagal memuat data dashboard." }, { status: 500 });
  }
}
