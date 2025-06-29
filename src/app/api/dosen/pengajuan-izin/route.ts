import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { StatusPengajuan } from "@/generated/prisma/client";

export async function GET(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "DOSEN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const statusParam = url.searchParams.get("status");

  // Validasi param status: jika undefined atau bukan enum -> default ke DIPROSES
  const status: StatusPengajuan =
    statusParam && ["DIPROSES", "DISETUJUI", "DITOLAK"].includes(statusParam)
      ? (statusParam as StatusPengajuan)
      : "DIPROSES";
  console.log(status);
  try {
    const pengajuan = await prisma.pengajuanIzin.findMany({
      where: {
        status,
        jadwal_kuliah: {
          dosenId: session.user.id, // pastikan jadwal kuliah dosennya sama dengan user login
        },
      },
      include: {
        mahasiswa: {
          select: {
            id: true,
            name: true,
            nim: true,
            foto: true,
          },
        },
        jadwal_kuliah: {
          select: {
            mata_kuliah: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: pengajuan });
  } catch (error) {
    console.error("[PENGAJUAN_IZIN_GET]", error);
    return NextResponse.json({ error: "Failed to fetch pengajuan izin" }, { status: 500 });
  }
}
