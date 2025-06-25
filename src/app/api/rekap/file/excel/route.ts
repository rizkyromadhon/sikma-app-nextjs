import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import ExcelJS from "exceljs";
import { auth } from "@/auth";
import { Prisma } from "@/generated/prisma/client";
import { format } from "date-fns";
import { id as localeID } from "date-fns/locale";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  const admin = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { prodiId: true, prodi: { select: { name: true } } },
  });

  if (!admin?.prodiId) {
    return NextResponse.json({ error: "Admin tidak terkait prodi" }, { status: 400 });
  }

  try {
    const filters = await request.json();

    if (!filters.semesterId || !filters.matkulId) {
      return NextResponse.json({ error: "Semester dan Mata Kuliah wajib dipilih." }, { status: 400 });
    }

    // Mengambil nama filter untuk ditampilkan di header Excel
    const [semesterInfo, matkulInfo, golonganInfo] = await Promise.all([
      prisma.semester.findUnique({ where: { id: filters.semesterId } }),
      prisma.mataKuliah.findUnique({ where: { id: filters.matkulId } }),
      filters.golonganId
        ? prisma.golongan.findUnique({ where: { id: filters.golonganId } })
        : Promise.resolve(null),
    ]);

    const whereClause: Prisma.PresensiKuliahWhereInput = {
      jadwal_kuliah: {
        semesterId: filters.semesterId,
        matkulId: filters.matkulId,
        prodiId: admin.prodiId,
        ...(filters.golonganId && {
          golongans: { some: { id: filters.golonganId } },
        }),
      },
    };

    const presensiData = await prisma.presensiKuliah.findMany({
      where: whereClause,
      include: {
        mahasiswa: { select: { name: true, nim: true } },
      },
      orderBy: [{ mahasiswa: { name: "asc" } }, { waktu_presensi: "asc" }],
    });

    // --- PEMBUATAN FILE EXCEL MODERN ---
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Sistem Kehadiran Mahasiswa";
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet("Rekap Kehadiran");

    // 1. Judul Utama
    worksheet.mergeCells("A1:F1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = "Rekapitulasi Kehadiran Mahasiswa";
    titleCell.font = { name: "Arial", size: 16, bold: true };
    titleCell.alignment = { horizontal: "center" };

    // 2. Info Filter
    worksheet.mergeCells("A2:F2");
    const filterInfoCell = worksheet.getCell("A2");
    const filterText = `${semesterInfo?.name} | Program Studi : ${admin.prodi?.name} | Golongan : ${
      golonganInfo?.name || "Semua"
    } | Mata Kuliah : ${matkulInfo?.name}`;
    filterInfoCell.value = filterText;
    filterInfoCell.font = { name: "Arial", size: 10, italic: true };
    filterInfoCell.alignment = { horizontal: "center" };
    worksheet.getCell("A3").value = ""; // Baris kosong untuk spasi

    // 3. Header Tabel
    const headerRow = worksheet.addRow([
      "No.",
      "NIM",
      "Nama Mahasiswa",
      "Tanggal",
      "Waktu Presensi",
      "Status",
    ]);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF22272E" } };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // 4. Isi Data
    presensiData.forEach((p, index) => {
      const row = worksheet.addRow([
        index + 1,
        p.mahasiswa.nim ?? "-",
        p.mahasiswa.name ?? "-",
        format(p.waktu_presensi, "eeee, dd LLLL yyyy", { locale: localeID }),
        format(p.waktu_presensi, "HH:mm:ss"),
        p.status,
      ]);
      // Beri border pada setiap sel di baris data
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    // 5. Sesuaikan Lebar Kolom
    worksheet.getColumn("A").width = 5;
    worksheet.getColumn("B").width = 15;
    worksheet.getColumn("C").width = 35;
    worksheet.getColumn("D").width = 25;
    worksheet.getColumn("E").width = 15;
    worksheet.getColumn("F").width = 15;

    const buffer = await workbook.xlsx.writeBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="rekap-kehadiran.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Gagal ekspor ke Excel:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
