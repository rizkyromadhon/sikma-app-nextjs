import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export const GET = async () => {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "MAHASISWA") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      semesterId: true,
      prodiId: true,
      golonganId: true,
    },
  });

  if (!user?.semesterId || !user.prodiId || !user.golonganId) {
    return NextResponse.json([], { status: 200 });
  }

  const jadwal = await prisma.jadwalKuliah.findMany({
    where: {
      semesterId: user.semesterId,
      prodiId: user.prodiId,
      golongans: {
        some: {
          id: user.golonganId,
        },
      },
    },
    select: {
      hari: true,
      jam_mulai: true,
      jam_selesai: true,
      mata_kuliah: { select: { name: true } },
      dosen: { select: { name: true, foto: true } },
      ruangan: { select: { name: true } },
    },
    orderBy: [{ hari: "asc" }, { jam_mulai: "asc" }],
  });

  const formatted = jadwal.map((j) => ({
    day: j.hari.charAt(0).toUpperCase() + j.hari.slice(1).toLowerCase(),
    start: format(new Date(j.jam_mulai), "HH:mm"),
    end: format(new Date(j.jam_selesai), "HH:mm"),
    matkul: j.mata_kuliah.name,
    dosen: j.dosen.name,
    ruangan: j.ruangan.name,
    foto: j.dosen.foto,
  }));

  return NextResponse.json(formatted);
};
