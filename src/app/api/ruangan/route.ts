import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

export async function POST(request: Request) {
  try {
    const { kode, name, type } = await request.json();
    if (!kode || !name || !type) {
      return NextResponse.json({ error: "Semua field wajib diisi." }, { status: 400 });
    }
    const newRuangan = await prisma.ruangan.create({ data: { kode, name, type } });
    return NextResponse.json(newRuangan, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Kode ruangan sudah ada." }, { status: 409 });
    }
    return NextResponse.json({ error: "Gagal menyimpan data." }, { status: 500 });
  }
}
