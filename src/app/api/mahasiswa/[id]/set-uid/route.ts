import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const mahasiswaId = id;

  try {
    const body = await request.json();
    const { uid } = body;

    if (!uid || typeof uid !== "string") {
      return NextResponse.json({ error: "UID harus diisi dan berupa string." }, { status: 400 });
    }

    // Cek apakah UID sudah dipakai mahasiswa lain
    const existing = await prisma.user.findFirst({
      where: {
        uid,
        NOT: {
          id: mahasiswaId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "UID sudah terdaftar pada mahasiswa lain." }, { status: 400 });
    }

    // Update UID mahasiswa
    const updated = await prisma.user.update({
      where: { id: mahasiswaId },
      data: { uid },
      select: { uid: true },
    });

    return NextResponse.json({ success: true, uid: updated.uid });
  } catch (error) {
    console.error(`Gagal menyimpan UID untuk mahasiswa ID: ${mahasiswaId}`, error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
