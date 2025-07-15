import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { status, catatan_dosen } = await req.json();
    console.log(status, catatan_dosen);

    if (!["DISETUJUI", "DITOLAK"].includes(status)) {
      return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
    }

    const updated = await prisma.pengajuanIzin.update({
      where: { id },
      data: {
        status,
        catatan_dosen: catatan_dosen || null,
      },
      include: {
        mahasiswa: true,
        jadwal_kuliah: true,
      },
    });

    // Update presensi pada tanggal & jadwal yang sama
    const tanggal = updated.tanggal_izin;
    const mahasiswaId = updated.mahasiswaId;
    const jadwalKuliahId = updated.jadwalKuliahId;

    const statusPresensi = status === "DISETUJUI" ? updated.tipe_pengajuan : "TIDAK_HADIR";

    const keteranganPresensi =
      status === "DISETUJUI"
        ? `${updated.tipe_pengajuan.charAt(0)}${updated.tipe_pengajuan
            .slice(1)
            .toLowerCase()} disetujui oleh dosen`
        : `${updated.tipe_pengajuan.charAt(0)}${updated.tipe_pengajuan
            .slice(1)
            .toLowerCase()} ditolak oleh dosen`;

    // Update kalau presensinya ada
    const existingPresensi = await prisma.presensiKuliah.findFirst({
      where: {
        mahasiswaId,
        jadwalKuliahId,
        waktu_presensi: {
          gte: new Date(tanggal.setHours(0, 0, 0, 0)),
          lte: new Date(tanggal.setHours(23, 59, 59, 999)),
        },
      },
    });

    if (existingPresensi) {
      await prisma.presensiKuliah.update({
        where: { id: existingPresensi.id },
        data: {
          status: statusPresensi,
          keterangan: keteranganPresensi,
        },
      });
    } else {
      // Jika belum ada presensinya, buat baru
      await prisma.presensiKuliah.create({
        data: {
          mahasiswaId,
          matkulId: updated.jadwal_kuliah.matkulId,
          jadwalKuliahId,
          waktu_presensi: new Date(updated.tanggal_izin),
          status: statusPresensi,
          keterangan: keteranganPresensi,
        },
      });
    }

    revalidatePath("/dosen/akademik/pengajuan-izin");

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
