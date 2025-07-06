import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth"; // NextAuth session
import { Hari, StatusPresensi } from "@/generated/prisma/client";
import { sendMessage } from "@/lib/socket";
import { toZonedTime, format } from "date-fns-tz";
import { id as localeID } from "date-fns/locale";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "MAHASISWA") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await prisma.presensiKuliah.findMany({
    where: { mahasiswaId: session.user.id },
    include: {
      mata_kuliah: true,
    },
    orderBy: {
      waktu_presensi: "desc",
    },
  });

  return NextResponse.json(
    data.map((item) => ({
      id: item.id,
      waktu_presensi: item.waktu_presensi,
      status: item.status,
      keterangan: item.keterangan,
      matkul: item.mata_kuliah?.name ?? "Mata kuliah tidak ditemukan",
    }))
  );
}

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};
export async function POST(request: Request) {
  try {
    const { uid, alatId } = await request.json();

    // Cari mahasiswa dan alat
    const [mahasiswa, alat] = await Promise.all([
      prisma.user.findUnique({
        where: { uid },
        select: {
          id: true,
          name: true,
          nim: true,
          role: true,
          foto: true,
          prodi: { select: { name: true, slug: true } },
          semester: { select: { name: true } },
          golongan: { select: { name: true } },
        },
      }),
      prisma.alatPresensi.findUnique({
        where: { id: alatId },
        select: { ruanganId: true },
      }),
    ]);

    console.log("Mahasiswa ditemukan:", mahasiswa?.id);

    const peserta = await prisma.pesertaKuliah.findMany({
      where: { mahasiswaId: mahasiswa?.id },
    });
    console.log(
      "Daftar jadwal yang diikuti:",
      peserta.map((p) => p.jadwalKuliahId)
    );

    if (!mahasiswa || mahasiswa.role !== "MAHASISWA") {
      const errorMessage = "UID tidak terdaftar";
      sendMessage({
        event: "broadcast",
        data: {
          event: "presensi-gagal",
          data: { mahasiswa: { name: "User Not Found" }, error: errorMessage, reason: "USER_NOT_FOUND" },
        },
      });
      return NextResponse.json({ error: "Mahasiswa tidak ditemukan." }, { status: 404 });
    }
    if (!alat) {
      return NextResponse.json({ error: "Alat Presensi tidak valid." }, { status: 404 });
    }

    const timeZone = "Asia/Jakarta";
    const now = new Date();
    const nowInWib = toZonedTime(now, timeZone);

    const hariIni = format(nowInWib, "EEEE", { locale: localeID, timeZone }).toUpperCase() as Hari;
    const currentTimeString = format(nowInWib, "HH:mm", { timeZone });
    const currentTimeInMinutes = timeToMinutes(currentTimeString);

    const potentialJadwals = await prisma.jadwalKuliah.findMany({
      where: {
        hari: hariIni,
        peserta: { some: { mahasiswaId: mahasiswa.id } },
      },
      include: {
        mata_kuliah: true,
        dosen: true,
        semester: true,
        prodi: true,
        golongans: true,
        ruangan: true,
      },
    });

    if (potentialJadwals.length === 0) {
      const errorMessage = "Tidak ada jadwal untuk Anda hari ini.";
      sendMessage({
        event: "broadcast",
        data: { event: "presensi-gagal", data: { mahasiswa, error: errorMessage } },
      });
      return NextResponse.json({ error: errorMessage }, { status: 404 });
    }

    const jadwalAktif = potentialJadwals.find((jadwal) => {
      const jamMulaiMin = timeToMinutes(jadwal.jam_mulai);
      const jamSelesaiMin = timeToMinutes(jadwal.jam_selesai);
      const waktuBukaPresensi = jamMulaiMin - 10;

      if (jamSelesaiMin <= jamMulaiMin) {
        return currentTimeInMinutes >= waktuBukaPresensi || currentTimeInMinutes < jamSelesaiMin;
      } else {
        return currentTimeInMinutes >= waktuBukaPresensi && currentTimeInMinutes <= jamSelesaiMin;
      }
    });

    if (!jadwalAktif) {
      const errorMessage = "Tidak ada jadwal aktif";
      sendMessage({
        event: "broadcast",
        data: { event: "presensi-gagal", data: { mahasiswa, error: errorMessage, reason: "NO_SCHEDULE" } },
      });
      return NextResponse.json({ error: errorMessage }, { status: 404 });
    }

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const sudahPresensi = await prisma.presensiKuliah.findFirst({
      where: {
        mahasiswaId: mahasiswa.id,
        jadwalKuliahId: jadwalAktif.id,
        waktu_presensi: { gte: todayStart, lte: todayEnd },
      },
    });

    if (sudahPresensi) {
      const errorMessage = "Anda sudah presensi";
      sendMessage({
        event: "broadcast",
        data: {
          event: "presensi-gagal",
          data: { mahasiswa, error: errorMessage, reason: "ALREADY_SCANNED" },
        },
      });
      return NextResponse.json({ error: errorMessage }, { status: 409 });
    }

    const jamMulaiMin = timeToMinutes(jadwalAktif.jam_mulai);
    const batasToleransiMin = jamMulaiMin + 10;
    const status: StatusPresensi = currentTimeInMinutes > batasToleransiMin ? "TERLAMBAT" : "HADIR";

    const presensi = await prisma.presensiKuliah.create({
      data: {
        status,
        mahasiswaId: mahasiswa.id,
        jadwalKuliahId: jadwalAktif.id,
        matkulId: jadwalAktif.matkulId,
        waktu_presensi: nowInWib,
      },
    });

    const payloadSukses = {
      event: "presensi-sukses",
      data: {
        mahasiswa,
        jadwal: {
          jadwalAktif,
          mata_kuliah: jadwalAktif.mata_kuliah,
        },
        presensi: { ...presensi, waktu_presensi: presensi.waktu_presensi?.toISOString() },
      },
    };

    sendMessage({ event: "broadcast", data: payloadSukses });

    return NextResponse.json({
      message: `Presensi ${status}`,
      mahasiswa: mahasiswa.name,
      matkul: jadwalAktif.mata_kuliah.name,
    });
  } catch (error) {
    console.error("Gagal menyimpan presensi:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
