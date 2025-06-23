// app/api/prodi/[id]/route.ts
import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";

function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");
}

async function handleRequest(method: "PUT" | "DELETE", request: Request, params: Promise<{ id: string }>) {
  const { id } = await params;
  const prodiId = id;

  try {
    if (method === "PUT") {
      const { name } = await request.json();
      if (!name) return NextResponse.json({ error: "Nama prodi wajib diisi." }, { status: 400 });
      const slug = createSlug(name);
      const updatedProdi = await prisma.programStudi.update({
        where: { id: prodiId },
        data: { name, slug },
      });
      return NextResponse.json(updatedProdi);
    }

    if (method === "DELETE") {
      await prisma.programStudi.delete({ where: { id: prodiId } });
      return NextResponse.json({ message: "Prodi berhasil dihapus." });
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return NextResponse.json({ error: "Data prodi tidak ditemukan." }, { status: 404 });
      }
      if (error.code === "P2002") {
        return NextResponse.json({ error: "Nama prodi sudah ada." }, { status: 409 });
      }
    }
    return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleRequest("PUT", request, params);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handleRequest("DELETE", request, params);
}
