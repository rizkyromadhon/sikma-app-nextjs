import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";

  try {
    const whereClause: Prisma.AlatPresensiWhereInput = search
      ? {
          OR: [
            {
              name: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              ruangan: {
                kode: {
                  contains: search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            },
          ],
        }
      : {};

    const data = await prisma.alatPresensi.findMany({
      where: whereClause,
      include: {
        ruangan: {
          select: {
            kode: true,
            name: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
    const now = new Date();
    const result = data.map((alat) => {
      const nyala = alat.jadwal_nyala ? new Date(alat.jadwal_nyala) : null;
      const mati = alat.jadwal_mati ? new Date(alat.jadwal_mati) : null;

      let dynamicStatus = alat.status;

      if (nyala && mati) {
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const start = nyala.getHours() * 60 + nyala.getMinutes();
        const end = mati.getHours() * 60 + mati.getMinutes();

        if (start < end) {
          dynamicStatus = currentTime >= start && currentTime < end ? "AKTIF" : "NONAKTIF";
        } else {
          dynamicStatus = currentTime >= start || currentTime < end ? "AKTIF" : "NONAKTIF";
        }
      }

      return {
        id: alat.id,
        name: alat.name,
        mode: alat.mode,
        status: dynamicStatus,
        jadwal_nyala: alat.jadwal_nyala?.toISOString() ?? null,
        jadwal_mati: alat.jadwal_mati?.toISOString() ?? null,
        ruangan: {
          kode: alat.ruangan.kode,
          name: alat.ruangan.name,
        },
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error saat GET /api/alat-presensi:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data alat presensi." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, ruanganId, jadwal_nyala, jadwal_mati } = body;

    if (!name || !ruanganId) {
      return NextResponse.json({ error: "Nama Alat dan Lokasi Ruangan wajib diisi." }, { status: 400 });
    }

    const dataToCreate: Prisma.AlatPresensiCreateInput = {
      name,
      ruangan: { connect: { id: ruanganId } },
      ...(jadwal_nyala && { jadwal_nyala: new Date(jadwal_nyala) }),
      ...(jadwal_mati && { jadwal_mati: new Date(jadwal_mati) }),
    };

    const newAlat = await prisma.alatPresensi.create({
      data: dataToCreate,
    });

    return NextResponse.json(newAlat, { status: 201 });
  } catch (error) {
    console.error("Gagal membuat Alat Presensi:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return NextResponse.json({ error: "Ruangan yang dipilih tidak valid." }, { status: 400 });
      }
    }
    return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
