import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { hashSync } from "bcrypt-ts";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const semesterId = searchParams.get("semesterId");
  const golonganId = searchParams.get("golonganId");
  const prodiId = searchParams.get("prodiId");

  if (!semesterId || !golonganId || !prodiId) {
    return NextResponse.json([], { status: 200 });
  }

  try {
    const mahasiswa = await prisma.user.findMany({
      where: {
        role: "MAHASISWA",
        prodiId,
        semesterId,
        golonganId,
      },
      select: {
        id: true,
        name: true,
        nim: true,
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(mahasiswa);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal mengambil data mahasiswa." }, { status: 500 });
  }
}

// Konfigurasi Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  const formData = await request.formData();

  const name = formData.get("name") as string;
  const nim = formData.get("nim") as string;
  const email = formData.get("email") as string;
  const no_hp = formData.get("no_hp") as string;
  const alamat = formData.get("alamat") as string;
  const semesterId = formData.get("semester") as string;
  const prodiId = formData.get("prodi") as string;
  const golonganId = formData.get("golongan") as string;
  const gender = formData.get("gender") as string;
  const foto = formData.get("foto") as File;
  const password = hashSync("passwordmahasiswa", 10);

  if (!name || !nim || !email || !semesterId || !prodiId || !golonganId || !gender) {
    return NextResponse.json(
      { error: "Semua field wajib diisi kecuali No HP, Alamat, dan Foto." },
      { status: 400 }
    );
  }

  let foto_url = null;

  // Proses upload foto jika ada
  if (foto) {
    try {
      // Ubah file menjadi buffer
      const bytes = await foto.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Upload ke Cloudinary
      const response = await new Promise<UploadApiResponse | undefined>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "mahasiswa" }, (err, result) => {
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

  // Simpan data ke database
  try {
    const newMahasiswa = await prisma.user.create({
      data: {
        name,
        nim,
        email,
        no_hp,
        alamat,
        gender,
        semesterId,
        prodiId,
        golonganId,
        foto: foto_url,
        role: "MAHASISWA",
        password: password,
      },
    });
    return NextResponse.json(newMahasiswa, { status: 201 });
  } catch (error) {
    console.error("Gagal membuat mahasiswa:", error);
    return NextResponse.json({ error: "Gagal menyimpan data mahasiswa ke database." }, { status: 500 });
  }
}
