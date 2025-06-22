import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const semesterId = searchParams.get("semesterId");
  const prodiId = searchParams.get("prodiId");

  if (!semesterId || !prodiId) {
    return NextResponse.json({ error: "semesterId dan prodiId diperlukan" }, { status: 400 });
  }

  try {
    const golongans = await prisma.golongan.findMany({
      where: {
        prodiId: prodiId,
        semesterId: semesterId,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(
      golongans.map((g) => ({
        id: g.id,
        name: g.name,
      }))
    );
  } catch (error) {
    console.error("Gagal mengambil golongan:", error);
    return NextResponse.json({ error: "Gagal mengambil golongan" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, prodiId, semesterId } = await request.json();
    console.log("Menerima permintaan untuk membuat golongan:", { name, prodiId, semesterId });
    if (!name || !prodiId)
      return NextResponse.json({ error: "Nama dan Prodi wajib diisi." }, { status: 400 });
    const newGolongan = await prisma.golongan.create({ data: { name, prodiId, semesterId } });
    return NextResponse.json(newGolongan, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Kombinasi nama golongan dan prodi sudah ada." }, { status: 409 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return NextResponse.json(
        { error: "Program Studi yang dipilih tidak valid atau tidak ada." },
        { status: 400 } // Bad Request
      );
    }
    return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
