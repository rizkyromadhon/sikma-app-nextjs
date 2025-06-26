import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const tipe = form.get("tipe") as string;
    const pesan = form.get("pesan") as string;
    const session = await auth();

    const userId = session?.user?.id;

    if (!session || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!tipe || !pesan) {
      return NextResponse.json({ error: "Tipe dan pesan wajib diisi" }, { status: 400 });
    }

    const laporan = await prisma.laporanMahasiswa.create({
      data: {
        tipe,
        pesan,
        userId: userId,
      },
    });

    return NextResponse.json({ success: true, laporan });
  } catch (err) {
    console.error("Gagal kirim laporan:", err);
    return NextResponse.json({ error: "Gagal mengirim laporan" }, { status: 500 });
  }
}
