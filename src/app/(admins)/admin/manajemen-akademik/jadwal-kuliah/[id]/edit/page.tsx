import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import EditJadwalForm from "./EditJadwalForm";

async function getFormData(adminProdiId: string, jadwalId: string) {
  const [jadwal, semesters, dosens, mataKuliahs, ruangans] = await Promise.all([
    prisma.jadwalKuliah.findUnique({
      where: { id: jadwalId, prodiId: adminProdiId }, 
      include: {
        golongans: { select: { id: true } },
        prodi: true,
      },
    }),
    prisma.semester.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({
      where: { role: "DOSEN", prodiId: adminProdiId },
      orderBy: { name: "asc" },
    }),
    prisma.mataKuliah.findMany({ orderBy: { name: "asc" } }),
    prisma.ruangan.findMany({ orderBy: { kode: "asc" } }),
  ]);

  if (!jadwal) {
    notFound();
  }

  return { jadwal, semesters, dosens, mataKuliahs, ruangans };
}

export default async function EditJadwalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/login?error=unauthorized");
  }

  const adminUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { prodiId: true },
  });

  if (!adminUser || !adminUser.prodiId) {
    return (
      <div className="p-8 text-center">
        <p className="text-xl text-red-500">
          Akses ditolak: Akun admin tidak terasosiasi dengan Program Studi.
        </p>
      </div>
    );
  }

  const { jadwal, ...formData } = await getFormData(adminUser.prodiId, id);

  // Serialisasi objek Date sebelum dikirim ke client
  const serializableJadwal = {
    ...jadwal,
    jam_mulai: jadwal.jam_mulai,
    jam_selesai: jadwal.jam_selesai,
  };

  return (
    <div className="w-full max-w-4xl mt-10 mx-auto p-8 bg-white dark:bg-black/20 rounded-md shadow">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Jadwal Kuliah</h1>
      <EditJadwalForm prodiId={adminUser.prodiId} jadwal={serializableJadwal} {...formData} />
    </div>
  );
}
