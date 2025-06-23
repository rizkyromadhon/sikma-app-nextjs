import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(request: Request) {
  const session = await auth();
  const prodiId = session?.user?.prodiId;

  if (!prodiId) {
    return NextResponse.json({ error: "Akses ditolak atau prodi tidak ditemukan" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const semesterId = searchParams.get("semesterId");

  if (!semesterId) {
    return NextResponse.json({ error: "Parameter semesterId wajib diisi." }, { status: 400 });
  }

  try {
    const jadwals = await prisma.jadwalKuliah.findMany({
      where: {
        prodiId: prodiId,
        semesterId: semesterId, // Pastikan tipe data cocok dengan skema
      },
      select: {
        matkulId: true, // Ambil hanya ID mata kuliahnya untuk efisiensi
      },
    });

    const uniqueMatkulIds = [...new Set(jadwals.map((j) => j.matkulId))];

    const mataKuliahs = await prisma.mataKuliah.findMany({
      where: {
        id: {
          in: uniqueMatkulIds, // Cari semua mata kuliah yang ID-nya ada di dalam daftar unik
        },
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc", // Urutkan hasilnya berdasarkan abjad
      },
    });

    return NextResponse.json(mataKuliahs);
  } catch (error) {
    console.error("Gagal mengambil opsi mata kuliah:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
