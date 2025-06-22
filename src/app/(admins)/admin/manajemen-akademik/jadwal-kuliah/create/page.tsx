import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CreateJadwalForm from "./CreateJadwalForm";

async function getFormData(adminProdiId: string) {
  const [semesters, dosens, mataKuliahs, golongans, ruangans] = await Promise.all([
    prisma.semester.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({
      where: { role: "DOSEN", prodiId: adminProdiId },
      orderBy: { name: "asc" },
    }),
    prisma.mataKuliah.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.golongan.findMany({
      where: { prodiId: adminProdiId },
      orderBy: { name: "asc" },
    }),
    prisma.ruangan.findMany({ orderBy: { kode: "asc" } }),
  ]);

  return { semesters, dosens, mataKuliahs, golongans, ruangans };
}

export default async function CreateJadwalPage() {
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
          Akses ditolak: Akun admin Anda tidak terasosiasi dengan Program Studi.
        </p>
      </div>
    );
  }

  const formData = await getFormData(adminUser.prodiId);

  return (
    <div className="w-full max-w-4xl mt-10 mx-auto p-8 bg-white dark:bg-black/20 rounded-md shadow-[0_0_10px_1px_#1a1a1a1a] dark:shadow-[0_0_20px_1px_#ffffff1a]">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Buat Jadwal Kuliah Baru</h1>
      <CreateJadwalForm
        prodiId={adminUser.prodiId}
        semesters={formData.semesters.map((s) => ({ id: s.id.toString(), name: s.name }))}
        dosens={formData.dosens.map((d) => ({ id: d.id, name: d.name }))}
        mataKuliahs={formData.mataKuliahs.map((mk) => ({ id: mk.id, name: mk.name }))}
        golongans={formData.golongans.map((g) => ({ id: g.id, name: g.name }))}
        ruangans={formData.ruangans.map((r) => ({ id: r.id.toString(), kode: r.kode, name: r.name }))}
      />
    </div>
  );
}
