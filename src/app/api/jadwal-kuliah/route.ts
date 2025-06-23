import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { hari, jam_mulai, jam_selesai, matkulId, dosenId, golonganIds, prodiId, ruanganId, semesterId } =
      body;

    console.log("Menerima permintaan untuk membuat jadwal kuliah:", body);

    if (
      !hari ||
      !jam_mulai ||
      !jam_selesai ||
      !matkulId ||
      !dosenId ||
      !prodiId ||
      !ruanganId ||
      !semesterId
    ) {
      return NextResponse.json({ error: "Data tidak lengkap." }, { status: 400 });
    }

    if (!Array.isArray(golonganIds)) {
      return NextResponse.json({ error: "golonganIds harus berupa array." }, { status: 400 });
    }

    if (new Date(jam_mulai) >= new Date(jam_selesai)) {
      return NextResponse.json({ error: "Jam mulai harus lebih awal dari jam selesai." }, { status: 400 });
    }

    const { is_kelas_besar } = body;

    const connectGolongans = golonganIds
      .filter((id: string) => id !== "__KELAS_BESAR__")
      .map((id: string) => ({ id }));

    const data = {
      hari,
      jam_mulai: new Date(jam_mulai),
      jam_selesai: new Date(jam_selesai),
      matkulId,
      dosenId,
      prodiId,
      ruanganId,
      semesterId,
      is_kelas_besar: is_kelas_besar,
      ...(connectGolongans.length > 0 && {
        golongans: { connect: connectGolongans },
      }),
    };

    console.log("Data yang akan disimpan:", data);

    const newJadwal = await prisma.jadwalKuliah.create({ data });

    return NextResponse.json(newJadwal, { status: 201 });
  } catch (error) {
    console.error("Gagal membuat jadwal:", error);
    console.error("DETAIL ERROR:", JSON.stringify(error, null, 2));
    return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
