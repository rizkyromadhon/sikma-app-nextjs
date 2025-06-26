import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "MAHASISWA") {
    return NextResponse.json([], { status: 401 });
  }

  const notifs = await prisma.notifikasi.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      sender: true,
    },
    take: 20,
  });

  return NextResponse.json(notifs);
}
