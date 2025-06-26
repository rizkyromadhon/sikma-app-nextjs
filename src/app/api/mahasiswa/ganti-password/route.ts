import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { compareSync, hashSync } from "bcrypt-ts";

export async function POST(req: Request) {
  const { oldPassword, newPassword } = await req.json();
  const session = await auth();

  if (!session?.user?.email) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user || !user.password) {
    return new Response(JSON.stringify({ message: "User tidak ditemukan" }), { status: 404 });
  }

  const isOldPasswordCorrect = compareSync(oldPassword, user.password);
  if (!isOldPasswordCorrect) {
    return new Response(JSON.stringify({ message: "Password lama salah." }), { status: 400 });
  }

  const hashed = hashSync(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashed,
    },
  });

  return new Response(JSON.stringify({ success: true }));
}
