// import { NextResponse } from "next/server";
// import prisma from "@/lib/prisma";
// import ExcelJS from "exceljs";
// import { auth } from "@/auth";

// export async function POST(request: Request) {
//   const session = await auth();
//   if (!session?.user?.id || session.user.role !== "ADMIN") {
//     return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
//   }

//   const admin = await prisma.user.findUnique({
//     where: { id: session.user.id },
//     select: { prodiId: true, prodi: { select: { name: true } } },
//   });

//   if (!admin?.prodiId) {
//     return NextResponse.json({ error: "Admin tidak terkait prodi" }, { status: 400 });
//   }

//   try {
//     const filters = await request.json();
//     if (!filters.semesterId || !filters.matkulId) {
//       return NextResponse.json({ error: "Semester dan Mata Kuliah wajib dipilih." }, { status: 400 });
//     }

//     const [semesterInfo, matkulInfo, golonganInfo] = await Promise.all([
//       prisma.semester.findUnique({ where: { id: filters.semesterId } }),
//       prisma.mataKuliah.findUnique({ where: { id: filters.matkulId } }),
//       filters.golonganId
//         ? prisma.golongan.findUnique({ where: { id: filters.golonganId } })
//         : Promise.resolve(null),
//     ]);
//     if (!semesterInfo || !matkulInfo) {
//       return NextResponse.json({ error: "Semester atau Mata Kuliah tidak ditemukan." }, { status: 404 });
//     }

//     const jadwals = await prisma.jadwalKuliah.findMany({
//       where: {
//         semesterId: filters.semesterId,
//         matkulId: filters.matkulId,
//         prodiId: admin.prodiId,
//         ...(filters.golonganId && { golongans: { some: { id: filters.golonganId } } }),
//       },
//       select: { id: true },
//     });
//     const jadwalIds = jadwals.map((j) => j.id);

//     const peserta = await prisma.pesertaKuliah.findMany({
//       where: { jadwalKuliahId: { in: jadwalIds } },
//       include: { mahasiswa: { select: { id: true, name: true, nim: true } } },
//     });

//     const presensiRecords = await prisma.presensiKuliah.findMany({
//       where: {
//         mahasiswaId: { in: peserta.map((p) => p.mahasiswa.id) },
//         jadwalKuliahId: { in: jadwalIds },
//       },
//       orderBy: { waktu_presensi: "asc" },
//     });

//     const presensiMap = new Map<string, Map<number, string>>();
//     const mingguKe = new Map<string, number>();
//     let currentMinggu = 1;

//     for (const jadwalId of jadwalIds) {
//       mingguKe.set(jadwalId, currentMinggu++);
//     }

//     presensiRecords.forEach((p) => {
//       if (!presensiMap.has(p.mahasiswaId)) {
//         presensiMap.set(p.mahasiswaId, new Map<number, string>());
//       }
//       const mingguIndex = mingguKe.get(p.jadwalKuliahId);
//       if (mingguIndex !== undefined) {
//         let statusChar = "-";
//         if (p.status === "HADIR") statusChar = "H";
//         else if (p.status === "TIDAK_HADIR") statusChar = "TH";
//         else if (p.status === "TERLAMBAT") statusChar = "T";
//         else if (["IZIN", "SAKIT"].includes(p.status)) statusChar = "I/S";

//         presensiMap.get(p.mahasiswaId)?.set(mingguIndex, statusChar);
//       }
//     });

//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet("Detail Kehadiran");

//     worksheet.views = [{ state: "frozen", ySplit: 5, xSplit: 0 }];

//     worksheet.mergeCells("A1:U1");
//     const titleCell = worksheet.getCell("A1");
//     titleCell.value = "Rekapitulasi Detail Kehadiran Mahasiswa";
//     titleCell.font = { name: "Arial", size: 16, bold: true };
//     titleCell.alignment = { horizontal: "center", vertical: "middle" };

//     worksheet.mergeCells("A2:U2");
//     const filterCell = worksheet.getCell("A2");
//     filterCell.value = `${semesterInfo.name} | Program Studi: ${admin.prodi?.name} | Golongan: ${
//       golonganInfo?.name || "Semua"
//     } | Mata Kuliah: ${matkulInfo.name}`;
//     filterCell.font = { name: "Arial", size: 10, italic: true };
//     filterCell.alignment = { horizontal: "center", vertical: "middle" };

//     worksheet.addRow([]);

//     const headerRow1 = worksheet.addRow([
//       "No.",
//       "NIM",
//       "Nama Mahasiswa",
//       "Minggu",
//       ...Array(15).fill(""),
//       "Total",
//       "Persentase",
//     ]);

//     const headerRow2 = worksheet.addRow(["", "", "", ...Array.from({ length: 16 }, (_, i) => i + 1), "", ""]);

//     worksheet.mergeCells("A4:A5");
//     worksheet.mergeCells("B4:B5");
//     worksheet.mergeCells("C4:C5");
//     worksheet.mergeCells("T4:T5");
//     worksheet.mergeCells("U4:U5");
//     worksheet.mergeCells("D4:S4");

//     [headerRow1, headerRow2].forEach((row) => {
//       row.eachCell({ includeEmpty: true }, (cell) => {
//         cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
//         cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF22272E" } };
//         cell.alignment = { horizontal: "center", vertical: "middle" };
//         cell.border = {
//           top: { style: "thin", color: { argb: "FF000000" } },
//           left: { style: "thin", color: { argb: "FF000000" } },
//           bottom: { style: "thin", color: { argb: "FF000000" } },
//           right: { style: "thin", color: { argb: "FF000000" } },
//         };
//       });
//     });

//     let currentExcelRow = 6;
//     for (const [index, p] of peserta.entries()) {
//       const rowData = [index + 1, p.mahasiswa.nim ?? "-", p.mahasiswa.name ?? "-"];

//       const mahasiswaPresensi = presensiMap.get(p.mahasiswa.id) || new Map<number, string>();
//       const statusPerMingguArray = Array(16).fill("-");
//       let totalValid = 0;

//       for (let i = 1; i <= 16; i++) {
//         const statusChar = mahasiswaPresensi.get(i) || "-";
//         statusPerMingguArray[i - 1] = statusChar;
//         if (["H", "T", "I/S"].includes(statusChar)) {
//           totalValid++;
//         }
//       }

//       const totalText = `${totalValid}/${16}`;
//       const persentase = ((totalValid / 16) * 100).toFixed(1) + "%";

//       rowData.push(...statusPerMingguArray, totalText, persentase);

//       const row = worksheet.addRow(rowData);

//       row.eachCell({ includeEmpty: true }, (cell) => {
//         cell.border = {
//           top: { style: "thin", color: { argb: "FF000000" } },
//           left: { style: "thin", color: { argb: "FF000000" } },
//           bottom: { style: "thin", color: { argb: "FF000000" } },
//           right: { style: "thin", color: { argb: "FF000000" } },
//         };
//         cell.alignment = { horizontal: "center", vertical: "middle" };
//       });
//       worksheet.getCell(`B${currentExcelRow}`).alignment = { horizontal: "left", vertical: "middle" };
//       worksheet.getCell(`C${currentExcelRow}`).alignment = { horizontal: "left", vertical: "middle" };
//       currentExcelRow++;
//     }

//     worksheet.addRow([]);
//     let keteranganStartRow = 6;
//     const keteranganStartCol = 23;

//     worksheet.mergeCells(keteranganStartRow, keteranganStartCol, keteranganStartRow, keteranganStartCol + 2);
//     const keteranganHeaderCell = worksheet.getCell(keteranganStartRow, keteranganStartCol);
//     keteranganHeaderCell.value = "Keterangan :";
//     keteranganHeaderCell.font = { italic: true, bold: true };
//     keteranganHeaderCell.alignment = { horizontal: "left", vertical: "middle" };

//     const keteranganList = [
//       { code: "H", desc: "Hadir" },
//       { code: "TH", desc: "Tidak Hadir" },
//       { code: "T", desc: "Terlambat" },
//       { code: "I/S", desc: "Izin atau Sakit" },
//     ];

//     keteranganList.forEach((item) => {
//       keteranganStartRow++;
//       const row = worksheet.getRow(keteranganStartRow);

//       row.getCell(keteranganStartCol).value = item.code;
//       row.getCell(keteranganStartCol + 1).value = "=";
//       row.getCell(keteranganStartCol + 2).value = item.desc;

//       row.getCell(keteranganStartCol).font = { italic: true };
//       row.getCell(keteranganStartCol + 1).font = { italic: true };
//       row.getCell(keteranganStartCol + 2).font = { italic: true };

//       row.getCell(keteranganStartCol).alignment = { horizontal: "right", vertical: "middle" };
//       row.getCell(keteranganStartCol + 1).alignment = { horizontal: "center", vertical: "middle" };
//       row.getCell(keteranganStartCol + 2).alignment = { horizontal: "left", vertical: "middle" };
//     });

//     const existingColumns = [
//       { key: "No", width: 5 },
//       { key: "NIM", width: 15 },
//       { key: "Nama", width: 35 },
//       ...Array(16).fill({ width: 6 }),
//       { key: "Total", width: 10 },
//       { key: "Persentase", width: 12 },
//     ];

//     const keteranganColumns = [
//       { key: `SpacingCol${keteranganStartCol - 1}`, width: 3 },
//       { key: "KeteranganCode", width: 5 },
//       { key: "KeteranganEquals", width: 3 },
//       { key: "KeteranganDesc", width: 15 },
//     ];

//     worksheet.columns = [...existingColumns, ...keteranganColumns];

//     const buffer = await workbook.xlsx.writeBuffer();
//     return new Response(buffer, {
//       status: 200,
//       headers: {
//         "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//         "Content-Disposition": `attachment; filename="rekap-detail-kehadiran-${semesterInfo.name}-${matkulInfo.name}.xlsx"`,
//       },
//     });
//   } catch (error) {
//     console.error("Gagal ekspor detail ke Excel:", error);
//     return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import ExcelJS from "exceljs";
import { auth } from "@/auth";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);

const MINGGU_AWAL_MULAI = dayjs("2025-06-30");

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

    const [semesterInfo, matkulInfo, golonganInfo] = await Promise.all([
      prisma.semester.findUnique({ where: { id: filters.semesterId } }),
      prisma.mataKuliah.findUnique({ where: { id: filters.matkulId } }),
      filters.golonganId
        ? prisma.golongan.findUnique({ where: { id: filters.golonganId } })
        : Promise.resolve(null),
    ]);
    if (!semesterInfo || !matkulInfo) {
      return NextResponse.json({ error: "Semester atau Mata Kuliah tidak ditemukan." }, { status: 404 });
    }

    const jadwals = await prisma.jadwalKuliah.findMany({
      where: {
        semesterId: filters.semesterId,
        matkulId: filters.matkulId,
        prodiId: admin.prodiId,
        ...(filters.golonganId && { golongans: { some: { id: filters.golonganId } } }),
      },
      select: { id: true, hari: true },
    });
    const jadwalIds = jadwals.map((j) => j.id);

    const peserta = await prisma.pesertaKuliah.findMany({
      where: { jadwalKuliahId: { in: jadwalIds } },
      include: { mahasiswa: { select: { id: true, name: true, nim: true } } },
    });

    const presensiRecords = await prisma.presensiKuliah.findMany({
      where: {
        mahasiswaId: { in: peserta.map((p) => p.mahasiswa.id) },
        jadwalKuliahId: { in: jadwalIds },
      },
      orderBy: { waktu_presensi: "asc" },
    });

    const presensiMap = new Map<string, Map<number, string>>();

    presensiRecords.forEach((p) => {
      if (!presensiMap.has(p.mahasiswaId)) {
        presensiMap.set(p.mahasiswaId, new Map<number, string>());
      }
      const presensiDate = dayjs(p.waktu_presensi);
      const weekNumber =
        presensiDate.day() === 0 || presensiDate.day() === 6
          ? -1
          : Math.floor(presensiDate.diff(MINGGU_AWAL_MULAI, "day") / 7) + 1;

      if (weekNumber > 0 && weekNumber <= 16) {
        let statusChar = "-";
        if (p.status === "HADIR") statusChar = "H";
        else if (p.status === "TIDAK_HADIR") statusChar = "TH";
        else if (p.status === "TERLAMBAT") statusChar = "T";
        else if (["IZIN", "SAKIT"].includes(p.status)) statusChar = "I/S";

        presensiMap.get(p.mahasiswaId)?.set(weekNumber, statusChar);
      }
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Detail Kehadiran");

    worksheet.views = [{ state: "frozen", ySplit: 5, xSplit: 0 }];

    worksheet.mergeCells("A1:U1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = "Rekapitulasi Detail Kehadiran Mahasiswa";
    titleCell.font = { name: "Arial", size: 16, bold: true };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };

    worksheet.mergeCells("A2:U2");
    const filterCell = worksheet.getCell("A2");
    filterCell.value = `${semesterInfo.name} | Program Studi: ${admin.prodi?.name} | Golongan: ${
      golonganInfo?.name || "Semua"
    } | Mata Kuliah: ${matkulInfo.name}`;
    filterCell.font = { name: "Arial", size: 10, italic: true };
    filterCell.alignment = { horizontal: "center", vertical: "middle" };

    worksheet.addRow([]);

    const headerRow1 = worksheet.addRow([
      "No.",
      "NIM",
      "Nama Mahasiswa",
      "Minggu",
      ...Array(15).fill(""),
      "Total",
      "Persentase",
    ]);

    const headerRow2 = worksheet.addRow(["", "", "", ...Array.from({ length: 16 }, (_, i) => i + 1), "", ""]);

    worksheet.mergeCells("A4:A5");
    worksheet.mergeCells("B4:B5");
    worksheet.mergeCells("C4:C5");
    worksheet.mergeCells("T4:T5");
    worksheet.mergeCells("U4:U5");
    worksheet.mergeCells("D4:S4");

    [headerRow1, headerRow2].forEach((row) => {
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF22272E" } };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
          top: { style: "thin", color: { argb: "FF000000" } },
          left: { style: "thin", color: { argb: "FF000000" } },
          bottom: { style: "thin", color: { argb: "FF000000" } },
          right: { style: "thin", color: { argb: "FF000000" } },
        };
      });
    });

    let currentExcelRow = 6;
    for (const [index, p] of peserta.entries()) {
      const rowData = [index + 1, p.mahasiswa.nim ?? "-", p.mahasiswa.name ?? "-"];

      const mahasiswaPresensi = presensiMap.get(p.mahasiswa.id) || new Map<number, string>();
      const statusPerMingguArray = Array(16).fill("-");
      let totalValid = 0;

      for (let i = 1; i <= 16; i++) {
        const statusChar = mahasiswaPresensi.get(i) || "-";
        statusPerMingguArray[i - 1] = statusChar;
        if (["H", "T", "I/S"].includes(statusChar)) {
          totalValid++;
        }
      }

      const totalText = `${totalValid}/${16}`;
      const persentase = ((totalValid / 16) * 100).toFixed(1) + "%";

      rowData.push(...statusPerMingguArray, totalText, persentase);

      const row = worksheet.addRow(rowData);

      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: "thin", color: { argb: "FF000000" } },
          left: { style: "thin", color: { argb: "FF000000" } },
          bottom: { style: "thin", color: { argb: "FF000000" } },
          right: { style: "thin", color: { argb: "FF000000" } },
        };
        cell.alignment = { horizontal: "center", vertical: "middle" };
      });
      worksheet.getCell(`B${currentExcelRow}`).alignment = { horizontal: "left", vertical: "middle" };
      worksheet.getCell(`C${currentExcelRow}`).alignment = { horizontal: "left", vertical: "middle" };
      currentExcelRow++;
    }

    worksheet.addRow([]);
    let keteranganStartRow = 6;
    const keteranganStartCol = 23;

    worksheet.mergeCells(keteranganStartRow, keteranganStartCol, keteranganStartRow, keteranganStartCol + 2);
    const keteranganHeaderCell = worksheet.getCell(keteranganStartRow, keteranganStartCol);
    keteranganHeaderCell.value = "Keterangan :";
    keteranganHeaderCell.font = { italic: true, bold: true };
    keteranganHeaderCell.alignment = { horizontal: "left", vertical: "middle" };

    const keteranganList = [
      { code: "H", desc: "Hadir" },
      { code: "TH", desc: "Tidak Hadir" },
      { code: "T", desc: "Terlambat" },
      { code: "I/S", desc: "Izin atau Sakit" },
    ];

    keteranganList.forEach((item) => {
      keteranganStartRow++;
      const row = worksheet.getRow(keteranganStartRow);

      row.getCell(keteranganStartCol).value = item.code;
      row.getCell(keteranganStartCol + 1).value = "=";
      row.getCell(keteranganStartCol + 2).value = item.desc;

      row.getCell(keteranganStartCol).font = { italic: true };
      row.getCell(keteranganStartCol + 1).font = { italic: true };
      row.getCell(keteranganStartCol + 2).font = { italic: true };

      row.getCell(keteranganStartCol).alignment = { horizontal: "right", vertical: "middle" };
      row.getCell(keteranganStartCol + 1).alignment = { horizontal: "center", vertical: "middle" };
      row.getCell(keteranganStartCol + 2).alignment = { horizontal: "left", vertical: "middle" };
    });

    const existingColumns = [
      { key: "No", width: 5 },
      { key: "NIM", width: 15 },
      { key: "Nama", width: 35 },
      ...Array(16).fill({ width: 6 }),
      { key: "Total", width: 10 },
      { key: "Persentase", width: 12 },
    ];

    const keteranganColumns = [
      { key: `SpacingCol${keteranganStartCol - 1}`, width: 3 },
      { key: "KeteranganCode", width: 5 },
      { key: "KeteranganEquals", width: 3 },
      { key: "KeteranganDesc", width: 15 },
    ];

    worksheet.columns = [...existingColumns, ...keteranganColumns];

    const buffer = await workbook.xlsx.writeBuffer();
    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="rekap-detail-kehadiran-${semesterInfo.name}-${matkulInfo.name}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Gagal ekspor detail ke Excel:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
