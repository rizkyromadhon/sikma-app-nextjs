import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth"; // pastikan ini tersedia

type UpdatePresensiPayload = {
  id: string;
  status: "HADIR" | "TIDAK_HADIR" | "IZIN" | "SAKIT";
}[];

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  try {
    const updates: UpdatePresensiPayload = await req.json();

    const result = await Promise.all(
      updates.map((item) =>
        prisma.presensiKuliah.update({
          where: { id: item.id },
          data: { status: item.status },
        })
      )
    );

    return NextResponse.json({ message: "Berhasil disimpan", updated: result.length });
  } catch (error) {
    console.error("Gagal update presensi:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
