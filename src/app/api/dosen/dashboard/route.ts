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
    const [kelasHariIniCount, totalMataKuliah, totalMahasiswaUnik, jamMengajarPerMinggu] = await Promise.all([
      prisma.jadwalKuliah.count({
        where: {
          dosenId: dosenId,
          hari: todayPrismaDay,
        },
      }),

      prisma.mataKuliah.count({
        where: {
          jadwal_kuliah: {
            some: {
              dosenId: dosenId,
            },
          },
        },
      }),

      prisma.user.count({
        where: {
          AND: [
            { role: "MAHASISWA" },
            {
              presensi: {
                some: {
                  jadwal_kuliah: {
                    dosenId: dosenId,
                  },
                },
              },
            },
          ],
        },
      }),

      prisma.jadwalKuliah
        .findMany({
          where: {
            dosenId: dosenId,
          },
          select: {
            jam_mulai: true,
            jam_selesai: true,
          },
        })
        .then((schedules) => {
          let totalMinutes = 0;
          schedules.forEach((schedule) => {
            const [startHour, startMinute] = schedule.jam_mulai.split(":").map(Number);
            const [endHour, endMinute] = schedule.jam_selesai.split(":").map(Number);

            const startTimeInMinutes = startHour * 60 + startMinute;
            const endTimeInMinutes = endHour * 60 + endMinute;

            if (endTimeInMinutes < startTimeInMinutes) {
              totalMinutes += endTimeInMinutes + 24 * 60 - startTimeInMinutes;
            } else {
              totalMinutes += endTimeInMinutes - startTimeInMinutes;
            }
          });
          return Math.round(totalMinutes / 60);
        }),
    ]);

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
