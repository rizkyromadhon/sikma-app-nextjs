import prisma from "@/lib/prisma";
import CreateAlatForm from "./CreateAlatForm";

// Fungsi untuk mengambil semua ruangan yang tersedia
async function getRuanganOptions() {
  const ruangans = await prisma.ruangan.findMany({
    orderBy: { kode: "asc" },
  });
  return ruangans;
}

export default async function CreateAlatPresensiPage() {
  const ruangans = await getRuanganOptions();

  return (
    <div className="w-full max-w-2xl mt-10 mx-auto p-8 bg-white dark:bg-black/20 rounded-md shadow-[0_0_10px_1px_#1a1a1a1a] dark:shadow-[0_0_20px_1px_#ffffff1a]">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Tambah Alat Presensi Baru</h1>
      <CreateAlatForm ruangans={ruangans} />
    </div>
  );
}
