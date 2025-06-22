import prisma from "@/lib/prisma";
import CreateMahasiswaForm from "@/app/(admins)/admin/manajemen-akademik/mahasiswa/create/CreateMahasiswaForm";


export default async function CreateMahasiswaPage() {
  const [semesters, prodis, golongans] = await Promise.all([
    prisma.semester.findMany({ orderBy: { name: "asc" } }),
    prisma.programStudi.findMany({ orderBy: { name: "asc" } }),
    prisma.golongan.findMany({
      select: { id: true, name: true, prodiId: true, semesterId: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div>
      <CreateMahasiswaForm
        semesters={semesters.map((s) => ({ id: s.id.toString(), name: s.name }))}
        prodis={prodis.map((p) => ({ id: p.id.toString(), name: p.name }))}
        golongans={golongans.map((g) => ({
          id: g.id.toString(),
          name: g.name,
          prodiId: g.prodiId.toString(),
          semesterId: g.semesterId.toString(),
        }))}
      />
    </div>
  );
}
