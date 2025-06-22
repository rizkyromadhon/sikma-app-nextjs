import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = await params;
  const mahasiswaId = id;

  try {
    const mahasiswa = await prisma.user.findUnique({
      where: {
        id: mahasiswaId,
      },
      select: {
        uid: true,
      },
    });

    if (!mahasiswa) {
      return NextResponse.json({ error: "Mahasiswa tidak ditemukan." }, { status: 404 });
    }

    // Kembalikan objek yang hanya berisi uid
    return NextResponse.json({ uid: mahasiswa.uid });
  } catch (error) {
    console.error(`Gagal mengambil status UID untuk mahasiswa ID: ${mahasiswaId}`, error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
