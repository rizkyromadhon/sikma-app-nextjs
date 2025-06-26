import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    return new Response("Unauthorized", { status: 401 });
  }

  const semesters = await prisma.semester.findMany({
    orderBy: { name: "asc" },
  });

  const admin = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { prodiId: true },
  });

  return Response.json({
    semesters,
    prodiId: admin?.prodiId || null,
  });
}
