import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mahasiswaId, jadwalKuliahId } = body;

    if (!mahasiswaId || !jadwalKuliahId) {
      return NextResponse.json(
        { error: "Mahasiswa dan Jadwal Kuliah harus diisi.", redirectParam: "missing_fields" },
        { status: 400 }
      );
    }

    const jadwal = await prisma.jadwalKuliah.findUnique({
      where: { id: jadwalKuliahId },
      include: { prodi: true },
    });
    if (!jadwal) {
      return NextResponse.json(
        { error: "Jadwal Kuliah tidak ditemukan.", redirectParam: "jadwal_not_found" },
        { status: 404 }
      );
    }

    const mahasiswa = await prisma.user.findUnique({
      where: { id: mahasiswaId },
      select: { id: true, prodiId: true, name: true },
    });
    if (!mahasiswa) {
      return NextResponse.json(
        { error: "Mahasiswa tidak ditemukan.", redirectParam: "mahasiswa_not_found" },
        { status: 404 }
      );
    }

    if (jadwal.prodi.id !== mahasiswa.prodiId) {
      return NextResponse.json(
        {
          error: "Mahasiswa dan Jadwal Kuliah bukan dari program studi yang sama.",
          redirectParam: "prodi_mismatch",
        },
        { status: 400 }
      );
    }

    const existing = await prisma.pesertaKuliah.findFirst({
      where: { mahasiswaId, jadwalKuliahId },
    });
    if (existing) {
      return NextResponse.json(
        {
          error: "Mahasiswa tersebut sudah terdaftar di jadwal kuliah tersebut.",
          redirectParam: "user_exists",
        },
        { status: 400 }
      );
    }

    const peserta = await prisma.pesertaKuliah.create({
      data: { mahasiswaId, jadwalKuliahId },
    });

    return NextResponse.json({
      message: `Mahasiswa ${mahasiswa.name} berhasil ditambahkan sebagai peserta.`,
      peserta,
    });
  } catch (error) {
    console.error("[PESERTA_KULIAH_POST]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menambahkan peserta kuliah.", redirectParam: "server_error" },
      { status: 500 }
    );
  }
}
