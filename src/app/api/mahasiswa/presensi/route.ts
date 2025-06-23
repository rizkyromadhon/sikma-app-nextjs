import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth"; // NextAuth session

export async function GET() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "MAHASISWA") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await prisma.presensiKuliah.findMany({
    where: { mahasiswaId: session.user.id },
    include: {
      mata_kuliah: true,
    },
    orderBy: {
      waktu_presensi: "desc",
    },
  });

  return NextResponse.json(
    data.map((item) => ({
      id: item.id,
      waktu_presensi: item.waktu_presensi,
      status: item.status,
      keterangan: item.keterangan,
      matkul: item.mata_kuliah?.name ?? "Mata kuliah tidak ditemukan",
    }))
  );
}
