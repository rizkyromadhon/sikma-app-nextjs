import { NextResponse } from "next/server";
import {  Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { name, prodiId } = await request.json();
    console.log("Menerima permintaan untuk membuat golongan:", { name, prodiId });
    if (!name || !prodiId)
      return NextResponse.json({ error: "Nama dan Prodi wajib diisi." }, { status: 400 });
    const newGolongan = await prisma.golongan.create({ data: { name, prodiId } });
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
