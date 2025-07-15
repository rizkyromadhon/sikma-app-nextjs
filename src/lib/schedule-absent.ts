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
  const todayStartOfDayUTC = dayjs().startOf("day").toDate();

  if (!todayEnum) {
    console.log(`Scheduler: Hari ${dayToday} tidak dikenali, proses dibatalkan.`);
    return;
  }

  const finishedSchedules = await prisma.jadwalKuliah.findMany({
    where: {
      hari: todayEnum as Hari,
      jam_selesai: { lt: currentTime },
    },
    select: {
      id: true,
      jam_mulai: true,
      jam_selesai: true,
      matkulId: true,
    },
  });

  for (const jadwal of finishedSchedules) {
    const [jamString, menitString] = jadwal.jam_mulai.split(":");
    const jam = parseInt(jamString);
    const menit = parseInt(menitString);

    const presensiDateTime = dayjs(todayStartOfDayUTC).set("hour", jam).set("minute", menit).toDate();

    const peserta = await prisma.pesertaKuliah.findMany({
      where: { jadwalKuliahId: jadwal.id },
      select: { mahasiswaId: true },
    });

    for (const { mahasiswaId } of peserta) {
      const presensi = await prisma.presensiKuliah.findFirst({
        where: {
          jadwalKuliahId: jadwal.id,
          mahasiswaId,
          waktu_presensi: {
            gte: todayStartOfDayUTC,
            lt: dayjs(todayStartOfDayUTC).add(1, "day").toDate(),
          },
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
            waktu_presensi: presensiDateTime,
          },
        });
      }
    }
  }

  console.log(`Scheduler: Tandai TIDAK_HADIR selesai. ${finishedSchedules.length} jadwal diproses.`);
}

// import { Hari } from "@/generated/prisma";
// import prisma from "@/lib/prisma";
// import dayjs from "dayjs";
// import weekday from "dayjs/plugin/weekday";
// import isBetween from "dayjs/plugin/isBetween";
// import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
// import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
// dayjs.extend(weekday);
// dayjs.extend(isBetween);
// dayjs.extend(isSameOrAfter);
// dayjs.extend(isSameOrBefore);

// export async function scheduleAbsentRange(startDate: string, endDate: string) {
//   const start = dayjs(startDate).startOf("day");
//   const end = dayjs(endDate).endOf("day");

//   const dayMap: Record<string, Hari> = {
//     MONDAY: "SENIN",
//     TUESDAY: "SELASA",
//     WEDNESDAY: "RABU",
//     THURSDAY: "KAMIS",
//     FRIDAY: "JUMAT",
//     SATURDAY: "SABTU",
//     SUNDAY: "MINGGU",
//   };

//   let current = start.clone();
//   let totalPresensiCreated = 0;

//   while (current.isSameOrBefore(end)) {
//     const dayEnum = dayMap[current.format("dddd").toUpperCase()];
//     const currentTime = current.format("HH:mm"); // not used in backdate

//     const finishedSchedules = await prisma.jadwalKuliah.findMany({
//       where: { hari: dayEnum },
//       select: {
//         id: true,
//         jam_mulai: true,
//         jam_selesai: true,
//         matkulId: true,
//       },
//     });

//     for (const jadwal of finishedSchedules) {
//       const [jamString, menitString] = jadwal.jam_mulai.split(":");
//       const jam = parseInt(jamString);
//       const menit = parseInt(menitString);

//       const presensiDateTime = current.clone().set("hour", jam).set("minute", menit).toDate();

//       const peserta = await prisma.pesertaKuliah.findMany({
//         where: { jadwalKuliahId: jadwal.id },
//         select: { mahasiswaId: true },
//       });

//       for (const { mahasiswaId } of peserta) {
//         const presensi = await prisma.presensiKuliah.findFirst({
//           where: {
//             jadwalKuliahId: jadwal.id,
//             mahasiswaId,
//             waktu_presensi: {
//               gte: current.startOf("day").toDate(),
//               lt: current.endOf("day").toDate(),
//             },
//           },
//         });

//         if (!presensi) {
//           await prisma.presensiKuliah.create({
//             data: {
//               mahasiswaId,
//               matkulId: jadwal.matkulId,
//               jadwalKuliahId: jadwal.id,
//               status: "TIDAK_HADIR",
//               keterangan: `Dibuat otomatis oleh sistem (${current.format("DD MMM YYYY")})`,
//               waktu_presensi: presensiDateTime,
//             },
//           });
//           totalPresensiCreated++;
//         }
//       }
//     }

//     console.log(`Tgl ${current.format("DD-MM-YYYY")} (${dayEnum}) selesai.`);
//     current = current.add(1, "day");
//   }

//   console.log(`Scheduler range selesai. Total presensi TIDAK_HADIR dibuat: ${totalPresensiCreated}`);
// }
