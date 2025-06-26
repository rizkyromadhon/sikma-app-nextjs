import { NextResponse } from "next/server";
import { auth } from "@/auth"; // Sesuaikan dengan auth-mu
import prisma from "@/lib/prisma";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "MAHASISWA") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      nim: true,
      email: true,
      foto: true,
      no_hp: true,
      alamat: true,
      gender: true,
      semester: { select: { name: true } },
      prodi: { select: { name: true } },
      golongan: { select: { name: true } },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    name: user.name,
    nim: user.nim,
    email: user.email,
    foto: user.foto,
    no_hp: user.no_hp ?? "-",
    alamat: user.alamat ?? "-",
    gender: user.gender,
    semester: user.semester?.name ?? "-",
    prodi: user.prodi?.name ?? "-",
    golongan: user.golongan?.name ?? "-",
  });
}

export async function PUT(req: Request) {
  const form = await req.formData();
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const no_hp = form.get("no_hp") as string;
  const alamat = form.get("alamat") as string;
  const foto = form.get("foto") as File | null;

  let fotoUrl: string | null = null;
  if (foto && typeof foto === "object") {
    const buffer = Buffer.from(await foto.arrayBuffer());
    const upload = await uploadToCloudinary(buffer, "mahasiswa-profil"); // folder cloudinary
    fotoUrl = upload.secure_url;
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      no_hp,
      alamat,
      ...(fotoUrl && { foto: fotoUrl }),
    },
    include: {
      semester: true,
      prodi: true,
      golongan: true,
    },
  });

  return NextResponse.json({
    ...updated,
    semester: updated.semester?.name ?? "-",
    prodi: updated.prodi?.name ?? "-",
    golongan: updated.golongan?.name ?? "-",
  });
}
