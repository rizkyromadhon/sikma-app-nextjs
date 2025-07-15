import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendMessage } from "@/lib/socket";
import { isAktifSekarang } from "@/lib/schedule-helper.js";
import { AlatMode } from "@/generated/prisma/client";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { mode, mahasiswaId } = await req.json();

    if (!mode || !Object.values(AlatMode).includes(mode)) {
      return NextResponse.json({ error: "Mode tidak valid." }, { status: 400 });
    }

    const updatedAlat = await prisma.alatPresensi.update({
      where: { id: id },
      data: {
        mode: mode,
        targetMahasiswaId: mode === "REGISTRASI" ? mahasiswaId : null,
      },
    });

    const broadcastData = {
      event: "config-update",
      alatId: updatedAlat.id,
      mode: updatedAlat.mode,
      status: isAktifSekarang(updatedAlat) ? "AKTIF" : "NONAKTIF",
    };

    sendMessage({ event: "broadcast", data: broadcastData });
    console.log("Mengirim pesan broadcast:", broadcastData);

    return NextResponse.json(updatedAlat);
  } catch (error) {
    console.error("Gagal mengubah mode alat:", error);
    return NextResponse.json({ error: "Gagal mengubah mode alat." }, { status: 500 });
  }
}
