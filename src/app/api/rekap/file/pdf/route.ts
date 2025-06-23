// File: app/api/rekap/export/pdf/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { Prisma } from "@/generated/prisma/client";
import { format } from "date-fns";
import { PDFDocument, rgb, StandardFonts, PageSizes } from "pdf-lib";

export async function POST(request: Request) {
  // 1. Otorisasi dan pengambilan data (sama seperti API Excel)
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

    // --- PEMBUATAN FILE PDF MODERN ---

    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage(PageSizes.A4);
    const { height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let y = height - 50;
    const margin = 50;

    // Judul Utama
    page.drawText("Rekapitulasi Kehadiran Mahasiswa", {
      x: margin,
      y: y,
      font: fontBold,
      size: 18,
      color: rgb(0, 0, 0),
    });
    y -= 25;

    // Info Filter
    const filterText = `${semesterInfo?.name} | ${admin.prodi?.name} | Gol. ${
      golonganInfo?.name || "Semua"
    } | ${matkulInfo?.name}`;
    page.drawText(filterText, {
      x: margin,
      y: y,
      font: font,
      size: 10,
      color: rgb(0.4, 0.4, 0.4), // Abu-abu
    });
    y -= 30;

    // const tableTopY = y;
    const tableHeaders = ["No", "NIM", "Nama Mahasiswa", "Tanggal", "Waktu", "Status"];
    const colWidths = [30, 90, 180, 100, 60, 60];
    const headerHeight = 20;

    page.drawRectangle({
      x: margin,
      y: y - headerHeight,
      width: colWidths.reduce((a, b) => a + b, 0),
      height: headerHeight,
      color: rgb(0.1, 0.1, 0.1),
    });

    let currentX = margin;
    tableHeaders.forEach((header, i) => {
      page.drawText(header, {
        x: currentX + 5,
        y: y - 14,
        font: fontBold,
        size: 9,
        color: rgb(1, 1, 1),
      });
      currentX += colWidths[i];
    });
    y -= headerHeight;

    presensiData.forEach((p, index) => {
      if (y < margin + 20) {
        page = pdfDoc.addPage(PageSizes.A4);
        y = height - 50;
      }

      const rowData = [
        (index + 1).toString(),
        p.mahasiswa.nim ?? "-",
        p.mahasiswa.name ?? "-",
        format(p.waktu_presensi, "dd/MM/yyyy"),
        format(p.waktu_presensi, "HH:mm:ss"),
        p.status,
      ];
      const rowHeight = 20;
      currentX = margin;

      rowData.forEach((text, i) => {
        page.drawText(text, {
          x: currentX + 5,
          y: y - 14,
          font: font,
          size: 9,
          color: rgb(0.2, 0.2, 0.2),
        });
        currentX += colWidths[i];
      });
      y -= rowHeight;
    });

    const pdfBytes = await pdfDoc.save();

    const pdfBuffer = Buffer.from(pdfBytes);

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="rekap-kehadiran.pdf"`,
      },
    });
  } catch (error) {
    console.error("Gagal ekspor ke PDF:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
