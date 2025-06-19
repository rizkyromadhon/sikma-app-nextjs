// app/api/semester/route.ts

import { NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@/generated/prisma/client";

export async function POST(request: Request) {
  const prisma = new PrismaClient();

  try {
    const body = await request.json();
    const { name, tipe } = body;

    if (!name || !tipe) {
      return NextResponse.json({ error: "Nama dan Tipe semester wajib diisi." }, { status: 400 });
    }

    const newSemester = await prisma.semester.create({
      data: {
        name,
        tipe,
      },
    });

    return NextResponse.json(newSemester, { status: 201 });
  } catch (error) {
    console.error("API SEMESTER CREATE ERROR:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "Nama semester sudah ada. Silakan gunakan nama lain." },
          { status: 409 }
        );
      }
    }

    // Fallback untuk error lainnya
    return NextResponse.json({ error: "Gagal memproses permintaan di server." }, { status: 500 });
  } finally {
    // Pastikan koneksi ditutup setelah selesai
    await prisma.$disconnect();
  }
}
