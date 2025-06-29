import PengajuanIzinClient from "./PengajuanIzinClient";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export default async function PengajuanIzinPage() {
  const session = await auth();
  if (!session || session.user.role !== "MAHASISWA") throw new Error("Unauthorized");

  const pesertaJadwals = await prisma.pesertaKuliah.findMany({
    where: { mahasiswaId: session.user.id },
    include: {
      jadwal_kuliah: {
        select: {
          id: true,
          hari: true,
          jam_mulai: true,
          jam_selesai: true,
          mata_kuliah: { select: { name: true } },
          dosen: { select: { name: true } },
        },
      },
    },
  });

  const mappedJadwals = pesertaJadwals.map((p) => ({
    id: p.jadwal_kuliah.id,
    hari: p.jadwal_kuliah.hari,
    mataKuliah: p.jadwal_kuliah.mata_kuliah.name,
    jam: `${p.jadwal_kuliah.jam_mulai} - ${p.jadwal_kuliah.jam_selesai}`,
    dosen: p.jadwal_kuliah.dosen.name,
  }));

  return <PengajuanIzinClient jadwals={mappedJadwals} />;
}
