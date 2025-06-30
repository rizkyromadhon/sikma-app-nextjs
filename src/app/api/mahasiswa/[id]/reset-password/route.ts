import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { hashSync } from "bcrypt-ts";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }

  const mahasiswaId = params.id;

  const mahasiswa = await prisma.user.findUnique({
    where: { id: mahasiswaId },
  });

  if (!mahasiswa) {
    return new Response(JSON.stringify({ message: "Mahasiswa tidak ditemukan" }), { status: 404 });
  }

  const newHashedPassword = hashSync("passwordmahasiswa", 10);

  await prisma.user.update({
    where: { id: mahasiswa.id },
    data: {
      password: newHashedPassword,
    },
  });

  return new Response(JSON.stringify({ success: true, message: "Password berhasil direset ke default." }));
}
