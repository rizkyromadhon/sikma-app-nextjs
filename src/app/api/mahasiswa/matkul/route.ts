import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

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

  // Ambil jadwal kuliah yang sesuai
  const jadwal = await prisma.jadwalKuliah.findMany({
    where: {
      semesterId: user.semesterId,
      prodiId: user.prodiId,
      golongans: {
        some: { id: user.golonganId },
      },
    },
    select: {
      mata_kuliah: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    distinct: ["matkulId"], // pastikan tidak duplikat
  });

  const matkulUnik = Array.from(new Map(jadwal.map((j) => [j.mata_kuliah.id, j.mata_kuliah])).values());

  return NextResponse.json(matkulUnik);
};
