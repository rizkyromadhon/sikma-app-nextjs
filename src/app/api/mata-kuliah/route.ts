import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

export async function POST(request: Request) {
  try {
    const { kode, name } = await request.json();
    if (!kode || !name) {
      return NextResponse.json({ error: "Semua field wajib diisi." }, { status: 400 });
    }
    const newMatkul = await prisma.mataKuliah.create({ data: { kode, name } });
    return NextResponse.json(newMatkul, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Kode mata kuliah sudah ada." }, { status: 409 });
    }
    return NextResponse.json({ error: "Gagal menyimpan data." }, { status: 500 });
  }
}
