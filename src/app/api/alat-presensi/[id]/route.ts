import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { format } from "date-fns-tz";
import { isAktifSekarang } from "@/lib/schedule-helper";
import { sendMessage } from "@/lib/socket";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const alat = await prisma.alatPresensi.findUnique({
      where: { id: id },
    });

    if (!alat) {
      return NextResponse.json({ error: "Alat tidak ditemukan." }, { status: 404 });
    }

    const responseData = {
      ...alat,
      jadwal_nyala: alat.jadwal_nyala
        ? format(alat.jadwal_nyala, "HH:mm", { timeZone: "Asia/Jakarta" })
        : null,
      jadwal_mati: alat.jadwal_mati ? format(alat.jadwal_mati, "HH:mm", { timeZone: "Asia/Jakarta" }) : null,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error(`Gagal mengambil data alat dengan ID: ${id}`, error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { name, ruanganId, jadwal_nyala, jadwal_mati } = body;

    if (!name || !ruanganId) {
      return NextResponse.json({ error: "Nama, Ruangan wajib diisi." }, { status: 400 });
    }

    const dataToUpdate: Prisma.AlatPresensiUpdateInput = {
      name,
      ruangan: { connect: { id: ruanganId } },
      jadwal_nyala: jadwal_nyala ? new Date(jadwal_nyala) : null,
      jadwal_mati: jadwal_mati ? new Date(jadwal_mati) : null,
    };

    const updatedAlat = await prisma.alatPresensi.update({
      where: { id: id },
      data: dataToUpdate,
    });

    const configDataForBroadcast = {
      event: "config-update",
      alatId: updatedAlat.id,
      mode: updatedAlat.mode,
      status: isAktifSekarang(updatedAlat) ? "AKTIF" : "NONAKTIF",
    };

    sendMessage({ event: "broadcast", data: configDataForBroadcast });
    console.log("Pesan broadcast dikirim:", configDataForBroadcast);

    return NextResponse.json(updatedAlat);
  } catch (error) {
    console.error(`Gagal mengupdate Alat Presensi dengan ID: ${id}`, error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Alat tidak ditemukan." }, { status: 404 });
    }
    return NextResponse.json({ error: "Gagal menyimpan perubahan." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await prisma.alatPresensi.delete({
      where: { id: id },
    });
    return NextResponse.json({ message: "Alat presensi berhasil dihapus." });
  } catch (error) {
    console.error(`Gagal menghapus Alat Presensi dengan ID: ${id}`, error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Alat tidak ditemukan." }, { status: 404 });
    }
    return NextResponse.json({ error: "Gagal menghapus data." }, { status: 500 });
  }
}
