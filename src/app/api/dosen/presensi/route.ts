import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { presensiId, newStatus } = body as {
      presensiId?: string;
      newStatus?: "HADIR" | "TIDAK_HADIR" | "IZIN" | "SAKIT";
    };

    if (!presensiId || !newStatus) {
      return NextResponse.json({ error: "Presensi ID dan status baru wajib diisi." }, { status: 400 });
    }

    const updated = await prisma.presensiKuliah.update({
      where: { id: presensiId },
      data: { status: newStatus },
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Data presensi tidak ditemukan atau gagal diupdate." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[UPDATE_PRESENSI_ERROR]", error);
    return NextResponse.json({ error: error?.message || "Terjadi kesalahan server." }, { status: 500 });
  }
}
