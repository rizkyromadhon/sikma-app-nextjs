// app/api/semester/[id]/route.ts

import { NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@/generated/prisma/client";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const prisma = new PrismaClient();
  const semesterId = parseInt(params.id, 10);

  if (isNaN(semesterId)) {
    return NextResponse.json({ error: "ID Semester tidak valid." }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { name, tipe } = body;

    if (!name || !tipe) {
      return NextResponse.json({ error: "Nama dan Tipe semester wajib diisi." }, { status: 400 });
    }

    const updatedSemester = await prisma.semester.update({
      where: {
        id: semesterId,
      },
      data: {
        name: name,
        tipe: tipe,
      },
    });

    return NextResponse.json(updatedSemester);
  } catch (error) {
    console.error("API UPDATE ERROR:", error);

    // Tangani error jika data dengan ID tersebut tidak ditemukan
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        // "Record to update not found."
        return NextResponse.json({ error: "Data semester tidak ditemukan." }, { status: 404 });
      }
    }

    return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
