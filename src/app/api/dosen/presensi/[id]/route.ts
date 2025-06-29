import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.nip) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { status } = body;

  if (!status) {
    return NextResponse.json({ error: "Status wajib diisi" }, { status: 400 });
  }

  try {
    // Update status presensi
    const presensi = await prisma.presensiKuliah.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(presensi);
  } catch (error) {
    console.error("[API DOSEN PRESENSI PATCH]", error);
    return NextResponse.json({ error: "Gagal mengupdate presensi" }, { status: 500 });
  }
}

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

    // sukses: redirect ke kelola-presensi dengan query success
    return NextResponse.redirect(
      `${req.nextUrl.origin}/dosen/kelola-presensi?kelola-presensi=update_status_success`,
      303
    );
  } catch (error: any) {
    console.error("[UPDATE_PRESENSI_ERROR]", error);
    return NextResponse.json({ error: error?.message || "Terjadi kesalahan server." }, { status: 500 });
  }
}
