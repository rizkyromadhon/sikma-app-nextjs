// import { NextResponse } from "next/server";
// import prisma from "@/lib/prisma";
// import { Prisma } from "@/generated/prisma/client";

// export async function POST(request: Request) {
//   try {
//     const body = await request.json();

//     const requiredFields = [
//       "hari",
//       "jam_mulai",
//       "jam_selesai",
//       "matkulId",
//       "dosenId",
//       "semesterId",
//       "prodiId",
//       "golonganId",
//       "ruanganId",
//     ];
//     for (const field of requiredFields) {
//       if (!body[field]) {
//         return NextResponse.json({ error: `Field '${field}' wajib diisi.` }, { status: 400 });
//       }
//     }

//     const dataToCreate: Prisma.JadwalKuliahCreateInput = {
//       hari: body.hari,
//       jam_mulai: new Date(body.jam_mulai),
//       jam_selesai: new Date(body.jam_selesai),
//       is_kelas_besar: false,
//       dosen: { connect: { id: body.dosenId } },
//       mata_kuliah: { connect: { id: body.matkulId } },
//       semester: { connect: { id: body.semesterId } },
//       prodi: { connect: { id: body.prodiId } },
//       ruangan: { connect: { id: body.ruanganId } },
//     };

//     if (body.golonganId === "__KELAS_BESAR__") {
//       dataToCreate.is_kelas_besar = true;
//       const semuaGolongan = await prisma.golongan.findMany({
//         where: {
//           prodiId: body.prodiId,
//           semesterId: body.semesterId,
//         },
//         select: { id: true },
//       });

//       if (semuaGolongan.length === 0) {
//         return NextResponse.json(
//           { error: "Tidak ada golongan ditemukan untuk prodi dan semester ini." },
//           { status: 400 }
//         );
//       }

//       dataToCreate.golongans = {
//         connect: semuaGolongan.map((g) => ({ id: g.id })),
//       };
//     } else {
//       dataToCreate.golongans = {
//         connect: [{ id: body.golonganId }],
//       };
//     }

//     const newJadwal = await prisma.jadwalKuliah.create({
//       data: dataToCreate,
//     });

//     return NextResponse.json(newJadwal, { status: 201 });
//   } catch (error) {
//     console.error("Gagal membuat jadwal:", error);
//     if (error instanceof Prisma.PrismaClientKnownRequestError) {
//       return NextResponse.json({ error: "Gagal menyimpan data karena kesalahan database." }, { status: 409 });
//     }
//     return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
//   }
// }
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
