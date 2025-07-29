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
  const golonganId = searchParams.get("golonganId");

  if (!semesterId || !golonganId) {
    return NextResponse.json({ error: "Parameter semesterId dan golonganId wajib diisi." }, { status: 400 });
  }

  try {
    const jadwals = await prisma.jadwalKuliah.findMany({
      where: {
        prodiId: prodiId,
        semesterId: semesterId,
        golongans: {
          some: { id: golonganId },
        },
      },
      include: {
        mata_kuliah: true,
      },
    });

    const uniqueMatkuls = Array.from(
      new Map(jadwals.map((j) => [j.mata_kuliah.id, j.mata_kuliah])).values()
    ).map((matkul) => ({
      id: matkul.id,
      name: matkul.name,
    }));

    uniqueMatkuls.sort((a, b) => a.name.localeCompare(b.name));

    // const mataKuliahs = await prisma.mataKuliah.findMany({
    //   where: {
    //     id: {
    //       in: uniqueMatkulIds,
    //     },
    //   },
    //   select: {
    //     id: true,
    //     name: true,
    //   },
    //   orderBy: {
    //     name: "asc",
    //   },
    // });

    return NextResponse.json(uniqueMatkuls);
  } catch (error) {
    console.error("Gagal mengambil opsi mata kuliah:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
