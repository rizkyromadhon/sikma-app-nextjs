import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { sendMessage } from "@/lib/socket";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id, status, balasan } = await req.json();

  const laporan = await prisma.laporanMahasiswa.update({
    where: { id },
    data: {
      status,
      balasan: balasan,
    },
  });

  await prisma.notifikasi.create({
    data: {
      tipe: status === "Selesai" ? "Laporan Selesai" : "Laporan Diproses",
      konten: balasan,
      url_tujuan: "/laporan-saya",
      userId: laporan.userId,
      senderId: session.user.id!,
    },
  });

  sendMessage({
    type: "notifikasi",
    targetUserId: laporan.userId,
    payload: {
      tipe: status === "Selesai" ? "Laporan Selesai" : "Laporan Diproses",
      konten: balasan,
      url_tujuan: "/laporan-saya",
    },
  });

  return NextResponse.json(laporan);
}
