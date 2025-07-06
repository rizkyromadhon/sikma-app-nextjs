import { Hari } from "@/generated/prisma";
import prisma from "@/lib/prisma";
import dayjs from "dayjs";

export async function scheduleAbsent() {
  const now = new Date();
  const currentTime = dayjs(now).format("HH:mm");

  const dayToday = dayjs().format("dddd").toUpperCase();

  const dayMap: Record<string, string> = {
    MONDAY: "SENIN",
    TUESDAY: "SELASA",
    WEDNESDAY: "RABU",
    THURSDAY: "KAMIS",
    FRIDAY: "JUMAT",
    SATURDAY: "SABTU",
    SUNDAY: "MINGGU",
  };

  const todayEnum = dayMap[dayToday];

  if (!todayEnum) {
    console.log(
      `Scheduler: Hari ${dayToday} tidak dikenali, proses dibatalkan.`
    );
    return;
  }

  const finishedSchedules = await prisma.jadwalKuliah.findMany({
    where: {
      hari: todayEnum as Hari,
      jam_selesai: { lt: currentTime },
    },
    select: {
      id: true,
      jam_selesai: true,
      matkulId: true,
    },
  });

  for (const jadwal of finishedSchedules) {
    const peserta = await prisma.pesertaKuliah.findMany({
      where: { jadwalKuliahId: jadwal.id },
      select: { mahasiswaId: true },
    });

    for (const { mahasiswaId } of peserta) {
      const presensi = await prisma.presensiKuliah.findFirst({
        where: {
          jadwalKuliahId: jadwal.id,
          mahasiswaId,
        },
      });

      if (!presensi) {
        await prisma.presensiKuliah.create({
          data: {
            mahasiswaId,
            matkulId: jadwal.matkulId,
            jadwalKuliahId: jadwal.id,
            status: "TIDAK_HADIR",
            keterangan: "Dibuat otomatis oleh sistem",
          },
        });
      }
    }
  }

  console.log(
    `Scheduler: Tandai TIDAK_HADIR selesai. ${finishedSchedules.length} jadwal diproses.`
  );
}
