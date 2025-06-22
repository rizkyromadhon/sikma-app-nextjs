// File: app/api/rfid-register/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendMessage } from "@/lib/socket"; // Gunakan helper yang sudah ada

export async function POST(request: Request) {
  try {
    // ESP32 akan mengirim UID dan ID alat yang digunakan
    const { uid, alatId } = await request.json();
    if (!uid || !alatId) {
      return NextResponse.json({ error: "UID dan ID Alat wajib diisi." }, { status: 400 });
    }

    // 1. Cari alat presensi untuk mengetahui siapa target mahasiswa saat ini
    const alat = await prisma.alatPresensi.findUnique({
      where: { id: alatId },
    });

    // Tolak jika alat tidak dalam mode registrasi atau tidak punya target
    if (!alat || alat.mode !== "REGISTRASI" || !alat.targetMahasiswaId) {
      return NextResponse.json({ error: "Tidak ada sesi registrasi aktif untuk alat ini." }, { status: 404 });
    }

    const targetMahasiswaId = alat.targetMahasiswaId;

    // 2. Ambil data mahasiswa target untuk perbandingan UID
    const targetMahasiswa = await prisma.user.findUnique({
      where: { id: targetMahasiswaId },
      select: { uid: true }, // Hanya butuh uid untuk perbandingan
    });

    if (!targetMahasiswa) {
      return NextResponse.json({ error: "Mahasiswa target tidak ditemukan." }, { status: 404 });
    }

    // 3. Tentukan status registrasi: sukses atau duplikat
    let registrationStatus: "success" | "duplicate" = "success";
    if (uid === targetMahasiswa.uid) {
      registrationStatus = "duplicate";
    }

    // 4. Update UID pada mahasiswa yang menjadi target
    await prisma.user.update({
      where: { id: targetMahasiswaId },
      data: { uid: uid },
    });

    // 5. Kirim hasil registrasi ke server WebSocket untuk disiarkan ke frontend admin
    const resultData = {
      event: "registration-result", // Nama event yang akan didengarkan frontend
      mahasiswaId: targetMahasiswaId,
      status: registrationStatus,
      uid: uid,
    };
    sendMessage({ event: "broadcast", data: resultData });
    console.log("Mengirim hasil registrasi via WebSocket:", resultData);

    return NextResponse.json({
      message: "Proses registrasi diterima.",
      status: registrationStatus,
    });
  } catch (error) {
    console.error("Gagal registrasi RFID:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
