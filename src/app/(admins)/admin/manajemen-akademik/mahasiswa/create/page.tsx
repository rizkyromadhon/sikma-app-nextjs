import  prisma  from "@/lib/prisma";
import CreateMahasiswaForm from "@/components/admin/manajemen-akademik/mahasiswa/CreateMahasiswaForm";

export default async function CreateMahasiswaPage() {
  const [semesters, prodis, golongans] = await Promise.all([
    prisma.semester.findMany({ orderBy: { name: "asc" } }),
    prisma.programStudi.findMany(),
    prisma.golongan.findMany(),
  ]);

  return (
    <div>
      <CreateMahasiswaForm
        semesters={semesters.map((s) => ({ id: s.id.toString(), name: s.name }))}
        prodis={prodis.map((p) => ({ id: p.id.toString(), name: p.name }))}
        golongans={golongans.map((g) => ({ id: g.id.toString(), name: g.name }))}
      />
    </div>
  );
}
