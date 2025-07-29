import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const body = await request.json();

    const {
      hari,
      jam_mulai,
      jam_selesai,
      matkulId,
      dosenId,
      semesterId,
      ruanganId,
      prodiId,
      is_kelas_besar,
      golonganIds,
    } = body;

    if (!Array.isArray(golonganIds)) {
      return NextResponse.json({ error: "Format golonganIds tidak valid." }, { status: 400 });
    }

    const dataToUpdate: Prisma.JadwalKuliahUpdateInput = {
      hari,
      jam_mulai: jam_mulai,
      jam_selesai: jam_selesai,
      is_kelas_besar,
      mata_kuliah: { connect: { id: matkulId } },
      dosen: { connect: { id: dosenId } },
      semester: { connect: { id: semesterId } },
      prodi: { connect: { id: prodiId } },
      ruangan: { connect: { id: ruanganId } },
      golongans: {
        set: golonganIds.map((gid: string) => ({ id: gid })),
      },
    };

    const updatedJadwal = await prisma.jadwalKuliah.update({
      where: { id: id },
      data: dataToUpdate,
    });

    const jadwalId = updatedJadwal.id;

    await prisma.pesertaKuliah.deleteMany({
      where: {
        jadwalKuliahId: jadwalId,
      },
    });

    const mahasiswaCocok = await prisma.user.findMany({
      where: {
        role: "MAHASISWA",
        prodiId,
        semesterId,
        golonganId: {
          in: golonganIds,
        },
      },
      select: {
        id: true,
      },
    });

    if (mahasiswaCocok.length > 0) {
      const pesertaBaru = mahasiswaCocok.map((m) => ({
        mahasiswaId: m.id,
        jadwalKuliahId: jadwalId,
      }));

      await prisma.pesertaKuliah.createMany({
        data: pesertaBaru,
        skipDuplicates: true,
      });
    }

    return NextResponse.json(updatedJadwal);
  } catch (error) {
    console.error(`Gagal mengupdate jadwal dengan ID: ${id}`, error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return NextResponse.json({ error: "Jadwal tidak ditemukan." }, { status: 404 });
      }
    }
    return NextResponse.json({ error: "Gagal menyimpan perubahan." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await prisma.jadwalKuliah.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Jadwal berhasil dihapus." });
  } catch (error) {
    console.error(`Gagal menghapus jadwal dengan ID: ${id}`, error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return NextResponse.json({ error: "Jadwal tidak ditemukan." }, { status: 404 });
      }
    }
    return NextResponse.json({ error: "Gagal menghapus data." }, { status: 500 });
  }
}
