// app/api/prodi/route.ts
import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";

function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/ /g, "-") // Ganti spasi dengan strip
    .replace(/[^\w-]+/g, ""); // Hapus semua karakter non-alfanumerik kecuali strip
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    if (!name) return NextResponse.json({ error: "Nama prodi wajib diisi." }, { status: 400 });
    const slug = createSlug(name);
    const newProdi = await prisma.programStudi.create({ data: { name, slug } });
    return NextResponse.json(newProdi, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Nama prodi sudah ada." }, { status: 409 });
    }
    return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
