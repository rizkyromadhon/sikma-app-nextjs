import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
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

    if (!mahasiswa || mahasiswa.role !== "MAHASISWA") {
      sendMessage({
        event: "broadcast",
        data: {
          event: "presensi-gagal",
          data: {
            mahasiswa: { name: "User Not Found" },
            error: "UID tidak terdaftar atau bukan mahasiswa.",
            reason: "USER_NOT_FOUND",
          },
        },
      });
      return NextResponse.json({ error: "UID tidak terdaftar atau bukan mahasiswa." }, { status: 404 });
    }

    if (!alat) {
      return NextResponse.json({ error: "Alat Presensi tidak valid." }, { status: 400 });
    }

    const timeZone = "Asia/Jakarta";
    const nowInWib = toZonedTime(new Date(), timeZone);
    const hariIni = format(nowInWib, "EEEE", { locale: localeID, timeZone }).toUpperCase() as Hari;
    const currentTimeInMinutes = timeToMinutes(format(nowInWib, "HH:mm", { timeZone }));

    const potentialJadwals = await prisma.jadwalKuliah.findMany({
      where: {
        hari: hariIni,
        peserta: { some: { mahasiswaId: mahasiswa.id } },
      },
      include: {
        mata_kuliah: true,
        dosen: true,
        ruangan: true,
      },
    });

    if (potentialJadwals.length === 0) {
      const errorMessage = "Tidak ada jadwal kuliah untuk Anda hari ini.";
      sendMessage({
        event: "broadcast",
        data: {
          event: "presensi-gagal",
          data: { mahasiswa, error: errorMessage, reason: "NO_SCHEDULE_TODAY" },
        },
      });
      return NextResponse.json({ error: errorMessage }, { status: 404 });
    }

    const jadwalAktif = potentialJadwals.find((jadwal) => {
      const jamMulaiMin = timeToMinutes(jadwal.jam_mulai);
      const jamSelesaiMin = timeToMinutes(jadwal.jam_selesai);
      const waktuBukaPresensi = jamMulaiMin - 15;

      return currentTimeInMinutes >= waktuBukaPresensi && currentTimeInMinutes <= jamSelesaiMin;
    });

    if (!jadwalAktif) {
      const errorMessage = "Saat ini tidak ada sesi kelas yang aktif untuk presensi.";
      sendMessage({
        event: "broadcast",
        data: {
          event: "presensi-gagal",
          data: { mahasiswa, error: errorMessage, reason: "NO_SCHEDULE" },
        },
      });
      return NextResponse.json({ error: errorMessage }, { status: 404 });
    }

    const todayStart = new Date(nowInWib);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(nowInWib);
    todayEnd.setHours(23, 59, 59, 999);

    const sudahPresensi = await prisma.presensiKuliah.findFirst({
      where: {
        mahasiswaId: mahasiswa.id,
        jadwalKuliahId: jadwalAktif.id,
        waktu_presensi: { gte: todayStart, lte: todayEnd },
      },
    });

    if (sudahPresensi) {
      const errorMessage = "Anda sudah melakukan presensi untuk mata kuliah ini.";
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
    const batasToleransiMin = jamMulaiMin + 15;
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

    const sudahPresensiLain = await prisma.presensiKuliah.findFirst({
      where: {
        mahasiswaId: mahasiswa.id,
        waktu_presensi: { gte: todayStart, lte: todayEnd },
        NOT: { id: presensi.id },
      },
    });

    const isFirstToday = !sudahPresensiLain;

    sendMessage({
      event: "broadcast",
      data: {
        event: "presensi-sukses",
        data: {
          mahasiswa,
          jadwal: jadwalAktif,
          presensi: { ...presensi, waktu_presensi: presensi.waktu_presensi?.toISOString() },
          isFirstToday,
        },
      },
    });

    return NextResponse.json({
      message: `Presensi berhasil dengan status: ${status}`,
      mahasiswa: mahasiswa.name,
      matkul: jadwalAktif.mata_kuliah.name,
    });
  } catch (error) {
    console.error("Gagal menyimpan presensi:", error);
    // Hindari mengirim detail error ke client
    return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
