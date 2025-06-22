import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { hashSync } from "bcrypt-ts";

// Konfigurasi Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  const formData = await request.formData();

  const name = formData.get("name") as string;
  const nip = formData.get("nip") as string;
  const email = formData.get("email") as string;
  const no_hp = formData.get("no_hp") as string;
  const alamat = formData.get("alamat") as string;
  const prodiId = formData.get("prodi") as string;
  const gender = formData.get("gender") as string;
  const foto = formData.get("foto") as File;
  const password = hashSync("passworddosen", 10);

  if (!name || !nip || !email || !prodiId || !gender) {
    return NextResponse.json(
      { error: "Semua field wajib diisi kecuali No HP, Alamat, dan Foto." },
      { status: 400 }
    );
  }

  let foto_url = null;

  if (foto) {
    try {
      const bytes = await foto.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const response = await new Promise<UploadApiResponse | undefined>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "dosen" }, (err, result) => {
            if (err) reject(err);
            resolve(result);
          })
          .end(buffer);
      });

      if (response && response.secure_url) {
        foto_url = response.secure_url;
      } else {
        throw new Error("Gagal mendapatkan URL dari Cloudinary setelah upload.");
      }
    } catch (error) {
      console.error("Gagal upload foto:", error);
      return NextResponse.json({ error: "Gagal mengupload foto." }, { status: 500 });
    }
  }

  try {
    const newDosen = await prisma.user.create({
      data: {
        name,
        nip,
        email,
        no_hp,
        alamat,
        gender,
        prodiId,
        foto: foto_url,
        role: "DOSEN",
        password: password,
      },
    });
    return NextResponse.json(newDosen, { status: 201 });
  } catch (error) {
    console.error("Gagal membuat dosen:", error);
    return NextResponse.json({ error: "Gagal menyimpan data dosen ke database." }, { status: 500 });
  }
}
