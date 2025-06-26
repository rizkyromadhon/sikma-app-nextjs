import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const { id } = await req.json();
  const session = await auth();

  if (!session || session.user.role !== "MAHASISWA") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await prisma.notifikasi.update({
    where: { id },
    data: { read_at: new Date() },
  });

  return NextResponse.json({ success: true });
}
