import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getDay } from "date-fns";

export async function GET() {
  const now = new Date();
  const day = getDay(now); // 0 (Minggu) - 6 (Sabtu)

  const hariEnum: Record<number, "MINGGU" | "SENIN" | "SELASA" | "RABU" | "KAMIS" | "JUMAT" | "SABTU"> = {
    0: "MINGGU",
    1: "SENIN",
    2: "SELASA",
    3: "RABU",
    4: "KAMIS",
    5: "JUMAT",
    6: "SABTU",
  };

  const jamSekarang = now.toTimeString().slice(0, 5); // "HH:mm"

  const jadwal = await prisma.jadwalKuliah.findFirst({
    where: {
      hari: hariEnum[day], // gunakan enum, bukan number
      jam_mulai: { lte: jamSekarang },
      jam_selesai: { gte: jamSekarang },
    },
    include: {
      mata_kuliah: true,
      ruangan: true,
      dosen: true,
    },
  });

  console.log(jadwal);

  return NextResponse.json(jadwal);
}
