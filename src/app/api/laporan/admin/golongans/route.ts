import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const semesterId = searchParams.get("semesterId");
  const prodiId = searchParams.get("prodiId");

  if (!semesterId || !prodiId) {
    return new Response("Missing params", { status: 400 });
  }

  const golongans = await prisma.golongan.findMany({
    where: {
      semesterId,
      prodiId,
    },
    orderBy: { name: "asc" },
  });

  return Response.json(golongans);
}
