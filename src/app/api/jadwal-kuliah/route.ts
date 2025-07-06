import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const semesterId = searchParams.get("semesterId");
  const prodiId = searchParams.get("prodiId");

  try {
    const jadwalKuliah = await prisma.jadwalKuliah.findMany({
      where: {
        ...(semesterId && { semesterId }),
        ...(prodiId && { prodiId }),
      },
      include: {
        mata_kuliah: true,
        dosen: true,
        prodi: true,
        ruangan: true,
        semester: true,
        golongans: true,
      },
      orderBy: { jam_mulai: "asc" },
    });

    return NextResponse.json(jadwalKuliah);
  } catch (error) {
    console.error("Gagal mengambil data jadwal kuliah:", error);
    return NextResponse.json({ error: "Gagal mengambil data jadwal kuliah" }, { status: 500 });
  }
}

// export async function GET(request: Request) {
//   try {
//     const jadwalKuliah = await prisma.jadwalKuliah.findMany({
//       include: {
//         mata_kuliah: true,
//         dosen: true,
//         prodi: true,
//         ruangan: true,
//         semester: true,
//         golongans: true,
//       },
//     });
//     return NextResponse.json(jadwalKuliah);
//   } catch (error) {
//     console.error("Gagal mengambil data jadwal kuliah:", error);
//     return NextResponse.json({ error: "Gagal mengambil data jadwal kuliah" }, { status: 500 });
//   }
// }

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      hari,
      jam_mulai,
      jam_selesai,
      matkulId,
      dosenId,
      golonganIds,
      prodiId,
      ruanganId,
      semesterId,
      is_kelas_besar,
    } = body;

    console.log("Menerima permintaan untuk membuat jadwal kuliah:", body);

    const dataToCreate: Prisma.JadwalKuliahCreateInput = {
      hari,
      jam_mulai: jam_mulai,
      jam_selesai: jam_selesai,
      is_kelas_besar: is_kelas_besar ?? false,
      mata_kuliah: { connect: { id: matkulId } },
      dosen: { connect: { id: dosenId } },
      prodi: { connect: { id: prodiId } },
      ruangan: { connect: { id: ruanganId } },
      semester: { connect: { id: semesterId } },
    };

    if (golonganIds && golonganIds.length > 0) {
      dataToCreate.golongans = {
        connect: golonganIds.map((id: string) => ({ id })),
      };
    }
    console.log("Data yang akan disimpan:", dataToCreate);

    const newJadwal = await prisma.jadwalKuliah.create({ data: dataToCreate });

    if (golonganIds && golonganIds.length > 0) {
      const mahasiswaList = await prisma.user.findMany({
        where: {
          role: "MAHASISWA",
          prodiId,
          semesterId,
          golonganId: { in: golonganIds },
        },
        select: { id: true },
      });

      const pesertaToCreate = mahasiswaList.map((mhs) => ({
        mahasiswaId: mhs.id,
        jadwalKuliahId: newJadwal.id,
      }));

      await prisma.pesertaKuliah.createMany({
        data: pesertaToCreate,
        skipDuplicates: true,
      });

      console.log(`Peserta otomatis ditambahkan: ${pesertaToCreate.length} mahasiswa.`);
    }

    return NextResponse.json(newJadwal, { status: 201 });
  } catch (error) {
    console.error("Gagal membuat jadwal:", error);
    console.error("DETAIL ERROR:", JSON.stringify(error, null, 2));
    return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
