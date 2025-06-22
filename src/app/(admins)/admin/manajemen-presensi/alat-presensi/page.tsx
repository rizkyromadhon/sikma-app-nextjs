import prisma from "@/lib/prisma";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { BsPlusCircleDotted } from "react-icons/bs";
import AlatPresensiTable from "./AlatPresensiTable";
import { Prisma } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

async function getAlatPresensi(search?: string) {
  const where: Prisma.AlatPresensiWhereInput = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { ruangan: { kode: { contains: search, mode: "insensitive" } } },
    ];
  }

  const data = await prisma.alatPresensi.findMany({
    where,
    include: {
      ruangan: { select: { kode: true, name: true } },
    },
    orderBy: { name: "asc" },
  });

  return data;
}

export default async function ManajemenAlatPresensiPage({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  const { search } = await searchParams;
  const searchParms = search;
  const data = await getAlatPresensi(searchParms);

  // Serialisasi objek Date sebelum dikirim ke client
  const serializableData = data.map((item) => ({
    ...item,
    jadwal_nyala: item.jadwal_nyala?.toISOString() || null,
    jadwal_mati: item.jadwal_mati?.toISOString() || null,
  }));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manajemen Alat Presensi</h1>
        <SubmitButton
          text="Tambah Alat"
          href="/admin/manajemen-presensi/alat-presensi/create"
          icon={<BsPlusCircleDotted />}
          className="bg-white dark:bg-black/50 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-black/10 hover:transition-all text-sm border border-gray-300 dark:border-gray-800 flex items-center gap-2 cursor-pointer"
        />
      </div>
      <AlatPresensiTable data={serializableData} initialSearch={search} />
    </div>
  );
}
