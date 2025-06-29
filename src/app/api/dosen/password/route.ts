import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { compareSync, hashSync } from "bcrypt-ts";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "DOSEN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { oldPassword, newPassword } = await req.json();
  if (!oldPassword || !newPassword) {
    return NextResponse.json({ error: "Password lama dan baru wajib diisi" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  });

  if (!user || !user.password) {
    return NextResponse.json({ error: "Akun tidak ditemukan" }, { status: 404 });
  }

  const isMatch = await compareSync(oldPassword, user.password);
  if (!isMatch) {
    return NextResponse.json({ error: "Password lama salah" }, { status: 400 });
  }

  const hashedNewPassword = await hashSync(newPassword, 10);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashedNewPassword },
  });

  return NextResponse.json({ success: true });
}
