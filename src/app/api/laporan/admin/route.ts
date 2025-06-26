import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json([], { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const semester = searchParams.get("semester") || undefined;
  const golongan = searchParams.get("golongan") || undefined;
  const status = searchParams.get("status") || undefined;
  const search = searchParams.get("search") || undefined;

  const laporan = await prisma.laporanMahasiswa.findMany({
    where: {
      user: {
        prodiId: session.user.prodiId,
        ...(semester && { semesterId: semester }),
        ...(golongan && { golonganId: golongan }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { nim: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      ...(status && status !== "all" && { status }),
    },
    include: {
      user: {
        include: {
          semester: true,
          golongan: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(laporan);
}
