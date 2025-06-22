import prisma from "@/lib/prisma";
import { isAktifSekarang } from "@/lib/schedule-helper";

export async function GET() {
  const list = await prisma.alatPresensi.findMany({
    select: { id: true, name: true, mode: true, jadwal_nyala: true, jadwal_mati: true },
  });

  const data = list.map((a) => ({
    id: a.id,
    name: a.name,
    mode: a.mode,
    status: isAktifSekarang(a) ? "AKTIF" : "NONAKTIF",
  }));

  return new Response(JSON.stringify(data), { status: 200 });
}
