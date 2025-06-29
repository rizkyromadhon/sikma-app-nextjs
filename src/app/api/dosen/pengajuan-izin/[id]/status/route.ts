import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { status, catatan_dosen } = await req.json();
    console.log(status, catatan_dosen);

    if (!["DISETUJUI", "DITOLAK"].includes(status)) {
      return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
    }

    const updated = await prisma.pengajuanIzin.update({
      where: { id },
      data: {
        status,
        catatan_dosen: catatan_dosen || null,
      },
    });

    revalidatePath("/dosen/akademik/pengajuan-izin");

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
