// app/api/laporan/me/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const laporan = await prisma.laporanMahasiswa.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      tipe: true,
      pesan: true,
      balasan: true,
      status: true,
      createdAt: true,
    },
  });

  return NextResponse.json(laporan);
}
