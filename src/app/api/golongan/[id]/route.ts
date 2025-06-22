import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = await params;
  const golonganId = id;

  try {
    const { name, prodiId, semesterId } = await request.json();
    if (!name || !prodiId) return NextResponse.json({ error: "Nama, Prodi, Semester wajib diisi" }, { status: 400 });
    const updated = await prisma.golongan.update({
      where: { id: golonganId },
      data: { name, prodiId: prodiId, semesterId: semesterId },
    });
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return NextResponse.json({ error: "Data prodi tidak ditemukan." }, { status: 404 });
      }
      if (error.code === "P2002") {
        return NextResponse.json({ error: "Nama prodi sudah ada." }, { status: 409 });
      }
    }
    return NextResponse.json({ error: "Gagal mengupdate" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Handler untuk DELETE
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = await params;
  const golonganId = id;

  try {
    await prisma.golongan.delete({ where: { id: golonganId } });
    return NextResponse.json({ message: "Berhasil dihapus" });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return NextResponse.json({ error: "Data prodi tidak ditemukan." }, { status: 404 });
      }
      if (error.code === "P2002") {
        return NextResponse.json({ error: "Nama prodi sudah ada." }, { status: 409 });
      }
    }
    return NextResponse.json({ error: "Gagal menghapus" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
