import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const matkulId = searchParams.get("matkulId");

  const startDate = from ? new Date(from) : undefined;
  const endDate = to ? new Date(to) : undefined;

  const mahasiswa = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      nim: true,
      semester: { select: { id: true, name: true } },
      prodi: { select: { name: true } },
      golongan: { select: { name: true } },
    },
  });

  const presensi = await prisma.presensiKuliah.findMany({
    where: {
      mahasiswaId: id,
      ...(startDate &&
        endDate && {
          waktu_presensi: {
            gte: startDate,
            lte: endDate,
          },
        }),
      ...(matkulId && {
        jadwal_kuliah: {
          matkulId: matkulId,
        },
      }),
    },
    include: {
      jadwal_kuliah: {
        select: {
          mata_kuliah: { select: { name: true } },
        },
      },
    },
    orderBy: { waktu_presensi: "asc" },
  });

  return NextResponse.json({
    mahasiswa,
    semesterId: mahasiswa?.semester?.id ?? null,
    presensi: presensi.map((p) => ({
      id: p.id,
      waktu_presensi: p.waktu_presensi,
      status: p.status,
      matkul: {
        name: p.jadwal_kuliah?.mata_kuliah?.name || "-",
      },
    })),
  });
}
