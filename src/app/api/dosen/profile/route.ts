import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "DOSEN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dosen = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      nip: true,
      email: true,
      alamat: true,
      foto: true,
      no_hp: true,
      prodi: {
        select: { name: true },
      },
    },
  });

  if (!dosen) {
    return NextResponse.json({ error: "Dosen tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({
    name: dosen.name,
    nip: dosen.nip,
    email: dosen.email,
    alamat: dosen.alamat ?? "-",
    foto: dosen.foto,
    no_hp: dosen.no_hp ?? "-",
    prodi: dosen.prodi?.name ?? "-",
  });
}

export async function PUT(req: Request) {
  const form = await req.formData();
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "DOSEN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const name = form.get("name") as string;
  const nip = form.get("nip") as string;
  const email = form.get("email") as string;
  const no_hp = form.get("no_hp") as string;
  const alamat = form.get("alamat") as string;
  const foto = form.get("foto") as File | null;

  let fotoUrl: string | null = null;
  if (foto && typeof foto === "object") {
    const buffer = Buffer.from(await foto.arrayBuffer());
    const upload = await uploadToCloudinary(buffer, "dosen");
    fotoUrl = upload.secure_url;
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      nip,
      email,
      no_hp,
      alamat,
      ...(fotoUrl && { foto: fotoUrl }),
    },
    include: {
      prodi: true,
    },
  });

  return NextResponse.json({
    name: updated.name,
    nip: updated.nip,
    email: updated.email,
    no_hp: updated.no_hp ?? "-",
    alamat: updated.alamat ?? "-",
    foto: updated.foto,
    prodi: updated.prodi?.name ?? "-",
  });
}
