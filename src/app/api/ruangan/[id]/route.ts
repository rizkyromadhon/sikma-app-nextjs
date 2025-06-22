import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

// Handler untuk PUT (Update)
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = await params;

  try {
    const { kode, name, type } = await request.json();
    if (!kode || !name || !type)
      return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });

    const updated = await prisma.ruangan.update({
      where: { id },
      data: { kode, name, type },
    });
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Kode ruangan sudah digunakan." }, { status: 409 });
    }
    return NextResponse.json({ error: "Gagal mengupdate data." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = await params;

  try {
    await prisma.ruangan.delete({ where: { id } });
    return NextResponse.json({ message: "Ruangan berhasil dihapus." });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Data ruangan tidak ditemukan." }, { status: 404 });
    } else if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return NextResponse.json({ error: "Data ruangan sedang digunakan." }, { status: 409 });
    }
    return NextResponse.json({ error: "Gagal menghapus data." }, { status: 500 });
  }
}
