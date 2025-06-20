// app/api/mahasiswa/[id]/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { Prisma } from "@/generated/prisma/client";

// Konfigurasi Cloudinary (wajib ada di setiap file yang menggunakannya)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Fungsi untuk mengekstrak public_id dari URL Cloudinary
const getPublicIdFromUrl = (url: string) => {
  const regex = /\/v\d+\/([^\/]+)\.\w{3,4}$/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

// --- Handler untuk UPDATE (PUT) ---
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const mahasiswaId = params.id;
  const formData = await request.formData();

  const name = formData.get("name") as string;
  const nim = formData.get("nim") as string;
  const email = formData.get("email") as string;
  const semesterIdStr = formData.get("semester") as string;
  const prodiId = formData.get("prodi") as string;
  const golonganId = formData.get("golongan") as string;
  const gender = formData.get("gender") as string;
  const fotoFile = formData.get("foto") as File | null;

  // Validasi input
  if (!name || !nim || !email || !semesterIdStr || !prodiId || !golonganId || !gender) {
    return NextResponse.json({ error: "Semua field wajib diisi." }, { status: 400 });
  }

  // Konversi ID relasi ke angka
  const semesterId = parseInt(semesterIdStr, 10);

  try {
    let uploadedFotoUrl: string | undefined = undefined;
    // Cek apakah ada foto baru yang di-upload
    if (fotoFile && fotoFile.size > 0) {
      // 1. Ambil data mahasiswa saat ini untuk mendapatkan URL foto lama
      const currentUser = await prisma.user.findUnique({ where: { id: mahasiswaId } });

      // 2. Jika ada foto lama, hapus dari Cloudinary
      if (currentUser?.foto) {
        const publicId = getPublicIdFromUrl(currentUser.foto);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      }

      // 3. Upload foto baru
      const bytes = await fotoFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const response = await new Promise<UploadApiResponse | undefined>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "mahasiswa" }, (err, result) => {
            if (err) reject(err);
            resolve(result);
          })
          .end(buffer);
      });
      if (response && response.secure_url) {
        uploadedFotoUrl = response.secure_url;
      }
    }

    // Buat objek data untuk diupdate
    const updateData: Prisma.UserUpdateInput = {
      name: formData.get("name") as string,
      nim: formData.get("nim") as string,
      email: formData.get("email") as string,
      no_hp: formData.get("no_hp") as string,
      alamat: formData.get("alamat") as string,
      gender: formData.get("gender") as string,
      semester: { connect: { id: semesterId } },
      prodi: { connect: { id: prodiId } },
      golongan: { connect: { id: golonganId } },
    };

    // Hanya tambahkan foto_url ke data update jika ada foto baru
    if (uploadedFotoUrl) {
      updateData.foto = uploadedFotoUrl;
    }

    const updatedMahasiswa = await prisma.user.update({
      where: { id: mahasiswaId },
      data: updateData,
    });

    return NextResponse.json(updatedMahasiswa);
  } catch (error) {
    console.error("Gagal mengupdate mahasiswa:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025")
        return NextResponse.json({ error: "Mahasiswa tidak ditemukan." }, { status: 404 });
      if (error.code === "P2002")
        return NextResponse.json({ error: "NIM atau Email sudah digunakan." }, { status: 409 });
    }
    return NextResponse.json({ error: "Gagal menyimpan perubahan." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const mahasiswaId = params.id;

  try {
    const userToDelete = await prisma.user.findUnique({
      where: { id: mahasiswaId },
    });

    // 2. Jika ada foto, hapus dari Cloudinary
    if (userToDelete?.foto) {
      const publicId = getPublicIdFromUrl(userToDelete.foto);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    }

    // 3. Hapus data dari database
    await prisma.user.delete({
      where: { id: mahasiswaId },
    });

    return NextResponse.json({ message: "Mahasiswa berhasil dihapus." });
  } catch (error) {
    console.error("Gagal menghapus mahasiswa:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return NextResponse.json({ error: "Mahasiswa tidak ditemukan." }, { status: 404 });
      }
    }
    return NextResponse.json({ error: "Gagal menghapus data." }, { status: 500 });
  }
}
