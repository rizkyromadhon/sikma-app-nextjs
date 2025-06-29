import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();

  try {
    const dosenNip = session?.user?.nip;

    const jadwals = await prisma.jadwalKuliah.findMany({
      where: { dosen: { nip: dosenNip } },
      select: {
        id: true,
        hari: true,
        jam_mulai: true,
        jam_selesai: true,
        is_kelas_besar: true,
        golongans: { select: { name: true } },
        mata_kuliah: { select: { name: true } },
        ruangan: { select: { name: true } },
        semester: { select: { name: true } },
        prodi: { select: { name: true } },
      },
      orderBy: [{ hari: "asc" }, { jam_mulai: "asc" }],
    });

    // Grouping jadwal per hari
    const jadwalPerHari: Record<string, any[]> = {};

    jadwals.forEach((jadwal) => {
      const hari = jadwal.hari; // misal: "Senin", "Selasa", ...
      if (!jadwalPerHari[hari]) jadwalPerHari[hari] = [];
      const semuaGolongan = jadwal.golongans.map((g) => g.name).join(", ");

      jadwalPerHari[hari].push({
        id: jadwal.id,
        jam_mulai: jadwal.jam_mulai.slice(0, 5), // H:i
        jam_selesai: jadwal.jam_selesai.slice(0, 5),
        mata_kuliah: jadwal.mata_kuliah?.name ?? "-",
        ruangan: jadwal.ruangan?.name ?? "-",
        semester: jadwal.semester?.name ?? "-",
        prodi: jadwal.is_kelas_besar
          ? `${jadwal.prodi?.name} - Semua golongan`
          : `${jadwal.prodi?.name} - ${semuaGolongan || "-"}`,
        is_kelas_besar: jadwal.is_kelas_besar,
      });
    });

    return NextResponse.json(jadwalPerHari);
  } catch (error) {
    console.error("[API JADWAL ERROR]", error);
    return NextResponse.json({ error: "Terjadi kesalahan saat mengambil jadwal" }, { status: 500 });
  }
}
