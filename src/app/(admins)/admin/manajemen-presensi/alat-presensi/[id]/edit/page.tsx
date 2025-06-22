import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditAlatForm from "./EditAlatForm";
// import { Ruangan } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

async function getFormData(alatId: string) {
  const [alat, ruangans] = await Promise.all([
    prisma.alatPresensi.findUnique({
      where: { id: alatId },
    }),
    prisma.ruangan.findMany({ orderBy: { kode: "asc" } }),
  ]);

  if (!alat) {
    notFound();
  }

  // Serialisasi objek Date sebelum dikirim ke client
  const serializableAlat = {
    ...alat,
    jadwal_nyala: alat.jadwal_nyala?.toISOString() || null,
    jadwal_mati: alat.jadwal_mati?.toISOString() || null,
  };

  return { alat: serializableAlat, ruangans };
}

export default async function EditAlatPresensiPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const { alat, ruangans } = await getFormData(id);

  return (
    <div className="w-full max-w-2xl mt-10 mx-auto p-8 bg-white dark:bg-black/20 rounded-md shadow-[0_0_10px_1px_#1a1a1a1a] dark:shadow-[0_0_20px_1px_#ffffff1a]">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Alat Presensi</h1>
      <EditAlatForm alat={alat} ruangans={ruangans} />
    </div>
  );
}
