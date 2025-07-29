import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { PDFDocument, rgb, StandardFonts, PageSizes } from "pdf-lib";
import { TipePengajuan } from "@/generated/prisma";

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

  const filters = await request.json();
  if (!filters.semesterId || !filters.matkulId) {
    return NextResponse.json({ error: "Semester dan Mata Kuliah wajib dipilih." }, { status: 400 });
  }

  try {
    const [semesterInfo, matkulInfo, golonganInfo] = await Promise.all([
      prisma.semester.findUnique({ where: { id: filters.semesterId } }),
      prisma.mataKuliah.findUnique({ where: { id: filters.matkulId } }),
      prisma.golongan.findUnique({ where: { id: filters.golonganId } }),
    ]);

    if (!semesterInfo || !matkulInfo) {
      return NextResponse.json({ error: "Semester atau Mata Kuliah tidak ditemukan." }, { status: 404 });
    }

    const jadwals = await prisma.jadwalKuliah.findMany({
      where: {
        semesterId: filters.semesterId,
        matkulId: filters.matkulId,
        prodiId: admin.prodiId,
        ...(filters.golonganId && {
          golongans: { some: { id: filters.golonganId } },
        }),
      },
      select: { id: true },
    });
    const jadwalIds = jadwals.map((j) => j.id);

    const peserta = await prisma.pesertaKuliah.findMany({
      where: { jadwalKuliahId: { in: jadwalIds } },
      include: {
        mahasiswa: { select: { id: true, name: true, nim: true } },
      },
    });

    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage(PageSizes.A4);
    const { height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    let y = height - 50;
    const margin = 50;

    page.drawText("Rekapitulasi Kehadiran Mahasiswa", {
      x: margin,
      y: y,
      font: fontBold,
      size: 18,
      color: rgb(0, 0, 0),
    });
    y -= 25;

    const filterText = `${semesterInfo.name} | ${admin.prodi?.name} | Gol. ${golonganInfo?.name} | ${matkulInfo.name}`;
    page.drawText(filterText, {
      x: margin,
      y,
      font,
      size: 10,
      color: rgb(0.4, 0.4, 0.4),
    });
    y -= 30;
    const tableHeaders = ["No", "NIM", "Nama", "Hadir", "Tidak Hadir", "Izin/Sakit", "Total", "Persentase"];
    const colWidths = [25, 65, 140, 45, 55, 55, 40, 60];
    const headerHeight = 20;

    page.drawRectangle({
      x: margin,
      y: y - headerHeight,
      width: colWidths.reduce((a, b) => a + b, 0),
      height: headerHeight,
      color: rgb(0.1, 0.1, 0.1),
      borderWidth: 1,
      borderColor: rgb(0, 0, 0),
    });

    let currentX = margin;
    tableHeaders.forEach((header, i) => {
      const textWidth = fontBold.widthOfTextAtSize(header, 8);
      const centerX = currentX + (colWidths[i] - textWidth) / 2;
      page.drawText(header, {
        x: centerX,
        y: y - 14,
        font: fontBold,
        size: 8,
        color: rgb(1, 1, 1),
      });
      currentX += colWidths[i];
    });
    y -= headerHeight;

    let nomor = 1;
    for (const p of peserta) {
      if (y < margin + 60) {
        page = pdfDoc.addPage(PageSizes.A4);
        y = height - 50;
      }

      const presensiMahasiswa = await prisma.presensiKuliah.findMany({
        where: { mahasiswaId: p.mahasiswa.id, jadwalKuliahId: { in: jadwalIds } },
      });

      const jumlah = { HADIR: 0, TERLAMBAT: 0, IZIN_DISETUJUI: 0, TIDAK_HADIR: 0 };
      for (const presensi of presensiMahasiswa) {
        if (["IZIN", "SAKIT"].includes(presensi.status)) {
          const pengajuan = await prisma.pengajuanIzin.findFirst({
            where: {
              mahasiswaId: p.mahasiswa.id,
              jadwalKuliahId: { in: jadwalIds },
              tipe_pengajuan: presensi.status as TipePengajuan,
            },
          });
          if (pengajuan?.status === "DISETUJUI") jumlah.IZIN_DISETUJUI++;
        } else if (presensi.status === "HADIR") jumlah.HADIR++;
        else if (presensi.status === "TIDAK_HADIR") jumlah.TIDAK_HADIR++;
      }

      const totalValid = jumlah.HADIR + jumlah.TERLAMBAT + jumlah.IZIN_DISETUJUI;
      const persentase = ((totalValid / 16) * 100).toFixed(1) + "%";
      const totalText = `${totalValid}/16`;

      const row = [
        nomor.toString(),
        p.mahasiswa.nim ?? "-",
        p.mahasiswa.name ?? "-",
        jumlah.HADIR.toString(),
        jumlah.TIDAK_HADIR.toString(),
        jumlah.IZIN_DISETUJUI.toString(),
        totalText,
        persentase,
      ];

      currentX = margin;
      row.forEach((text, i) => {
        let textX;
        if (i === 1 || i === 2) {
          textX = currentX + 2;
        } else {
          const textWidth = font.widthOfTextAtSize(text, 8);
          textX = currentX + (colWidths[i] - textWidth) / 2;
        }
        page.drawText(text, {
          x: textX,
          y: y - 14,
          font,
          size: 8,
          color: rgb(0.2, 0.2, 0.2),
        });
        currentX += colWidths[i];
      });
      y -= 20;
      nomor++;
    }

    if (y < margin + 50) {
      page = pdfDoc.addPage(PageSizes.A4);
      y = height - 50;
    }

    // const keterangan = ["Keterangan :", "H   = Hadir", "TH = Tidak Hadir", "I/S = Izin atau Sakit"];
    // keterangan.forEach((line, i) => {
    //   page.drawText(line, {
    //     x: margin,
    //     y: y - 30 - i * 14,
    //     font,
    //     size: 9,
    //     color: rgb(0.3, 0.3, 0.3),
    //   });
    // });

    const pdfBytes = await pdfDoc.save();
    const pdfBuffer = Buffer.from(pdfBytes);

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="rekap-kehadiran.pdf"`,
      },
    });
  } catch (err) {
    console.error("Gagal ekspor:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
