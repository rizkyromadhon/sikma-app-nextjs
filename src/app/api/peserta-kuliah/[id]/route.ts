import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: "ID peserta kuliah tidak ditemukan", redirectParam: "invalid_id" },
      { status: 400 }
    );
  }

  try {
    const peserta = await prisma.pesertaKuliah.findUnique({
      where: { id },
    });

    if (!peserta) {
      return NextResponse.json(
        { error: "Peserta kuliah tidak ditemukan", redirectParam: "not_found" },
        { status: 404 }
      );
    }

    await prisma.pesertaKuliah.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Peserta kuliah berhasil dihapus" });
  } catch (error) {
    console.error("Gagal menghapus peserta kuliah:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menghapus peserta kuliah", redirectParam: "delete_error" },
      { status: 500 }
    );
  }
}
