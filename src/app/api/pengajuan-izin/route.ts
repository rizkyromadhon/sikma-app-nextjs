import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import cloudinary from "@/lib/cloudinary";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "MAHASISWA") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.id) {
      return NextResponse.json({ error: "ID mahasiswa tidak ditemukan di session" }, { status: 400 });
    }

    const pengajuans = await prisma.pengajuanIzin.findMany({
      where: { mahasiswaId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        tipe_pengajuan: true,
        catatan_dosen: true,
        jadwal_kuliah: {
          include: {
            mata_kuliah: { select: { name: true } },
          },
        },
        tanggal_izin: true,
        pesan: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      pengajuans.map((p) => ({
        id: p.id,
        tipe: p.tipe_pengajuan,
        jadwal_kuliah: p.jadwal_kuliah,
        tanggal_izin: p.tanggal_izin,
        catatan_dosen: p.catatan_dosen,
        alasan: p.pesan,
        status: p.status,
        createdAt: p.createdAt,
      }))
    );
  } catch (error) {
    console.error("Gagal mengambil pengajuan izin:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "MAHASISWA") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.id) {
      return NextResponse.json({ error: "ID mahasiswa tidak ditemukan di session" }, { status: 400 });
    }

    const formData = await req.formData();
    const tanggal_izin = formData.get("tanggal_izin");
    const jadwalKuliahId = formData.get("jadwalKuliahId") as string;
    const pesan = formData.get("pesan") as string;
    const tipe_pengajuan = formData.get("tipe_pengajuan") as string;
    const file = formData.get("file_bukti") as File | null;

    let file_bukti: string | null = null;

    if (file && file.size > 0) {
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        return NextResponse.json({ error: "Ukuran file maksimal 5MB." }, { status: 400 });
      }

      const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ error: "File harus berupa PDF, JPG, atau PNG." }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      const uploadRes = await new Promise<{ secure_url: string }>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "pengajuan_izin",
              resource_type: "auto",
              format: file.type === "application/pdf" ? "pdf" : undefined,
            },
            (error, result) => {
              if (error) return reject(error);
              if (!result?.secure_url) return reject(new Error("Upload gagal"));
              resolve({ secure_url: result.secure_url });
            }
          )
          .end(buffer);
      });

      file_bukti = uploadRes.secure_url;
    }

    const pengajuan = await prisma.pengajuanIzin.create({
      data: {
        tanggal_izin: new Date(tanggal_izin as string),
        tipe_pengajuan: tipe_pengajuan === "SAKIT" ? "SAKIT" : "IZIN",
        pesan,
        file_bukti,
        mahasiswaId: session.user.id,
        jadwalKuliahId,
      },
    });

    return NextResponse.json({ pengajuan });
  } catch (error) {
    console.error("Gagal menyimpan pengajuan izin:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
