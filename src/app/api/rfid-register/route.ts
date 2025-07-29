import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendMessage } from "@/lib/socket";

export async function POST(request: Request) {
  try {
    const { uid, alatId } = await request.json();
    if (!uid || !alatId) {
      return NextResponse.json({ error: "UID dan ID Alat wajib diisi." }, { status: 400 });
    }

    const alat = await prisma.alatPresensi.findUnique({
      where: { id: alatId },
    });

    if (!alat || alat.mode !== "REGISTRASI" || !alat.targetMahasiswaId) {
      return NextResponse.json({ error: "Tidak ada sesi registrasi aktif untuk alat ini." }, { status: 404 });
    }

    const targetMahasiswaId = alat.targetMahasiswaId;

    const existingUserWithUid = await prisma.user.findFirst({
      where: {
        uid,
        NOT: { id: targetMahasiswaId },
      },
      select: { id: true, name: true },
    });

    let status: "success" | "used" = "success";
    let usedByName: string | null = null;

    if (existingUserWithUid) {
      status = "used";
      usedByName = existingUserWithUid.name ?? "-";
    } else {
      await prisma.user.update({
        where: { id: targetMahasiswaId },
        data: { uid },
      });
    }

    const resultData = {
      event: "registration-result",
      mahasiswaId: targetMahasiswaId,
      status,
      uid,
      usedByName,
    };
    sendMessage({ event: "broadcast", data: resultData });

    return NextResponse.json({
      message: "Proses registrasi diterima.",
      status,
      usedByName,
    });
  } catch (error) {
    console.error("Gagal registrasi RFID:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
