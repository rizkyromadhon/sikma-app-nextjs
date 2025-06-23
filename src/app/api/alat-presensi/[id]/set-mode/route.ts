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

    // Update database terlebih dahulu
    const updatedAlat = await prisma.alatPresensi.update({
      where: { id: id },
      data: {
        mode: mode,
        // Set target mahasiswa jika mode REGISTRASI, jika tidak, null-kan
        targetMahasiswaId: mode === "REGISTRASI" ? mahasiswaId : null,
      },
    });

    // PERBAIKAN 2: Siapkan pesan lengkap untuk disiarkan
    const broadcastData = {
      event: "config-update", // Event yang akan didengarkan oleh ESP32
      alatId: updatedAlat.id,
      mode: updatedAlat.mode,
      // Hitung status "live" berdasarkan data terbaru
      status: isAktifSekarang(updatedAlat) ? "AKTIF" : "NONAKTIF",
    };

    // PERBAIKAN 3: Gunakan sendMessage untuk mengirim pesan ke server.js
    sendMessage({ event: "broadcast", data: broadcastData });
    console.log("Mengirim pesan broadcast:", broadcastData);

    return NextResponse.json(updatedAlat);
  } catch (error) {
    console.error("Gagal mengubah mode alat:", error);
    return NextResponse.json({ error: "Gagal mengubah mode alat." }, { status: 500 });
  }
}
