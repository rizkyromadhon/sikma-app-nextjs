import  prisma  from "@/lib/prisma";
import MahasiswaTable from "@/components/admin/manajemen-akademik/mahasiswa/MahasiswaTable";
import { BsPlusCircleDotted } from "react-icons/bs";
import { SubmitButton } from "@/components/auth/SubmitButton";

export default async function ManageMahasiswaPage({
  searchParams,
}: {
  searchParams?: {
    semester?: string;
    prodi?: string;
    golongan?: string;
    nim?: string;
  };
}) {
  const { semester, prodi, golongan, nim } = (await searchParams) || {};

  const semesterId = semester ? parseInt(semester) : undefined;

  const mahasiswa = await prisma.user.findMany({
    where: {
      role: "MAHASISWA",
      nim: { not: null },
      ...(semester && { semesterId }),
      ...(prodi && { prodiId: prodi }),
      ...(golongan && { golonganId: golongan }),
      ...(nim && { nim: { contains: nim } }),
    },
    include: {
      prodi: true,
      golongan: true,
      semester: true,
    },
    orderBy: { name: "asc" },
  });

  const [semesters, prodis, golongans] = await Promise.all([
    prisma.semester.findMany({ orderBy: { name: "asc" } }),
    prisma.programStudi.findMany({}),
    prisma.golongan.findMany({}),
  ]);

  const cleanedMahasiswa = mahasiswa.map((m) => ({
    ...m,
    nim: m.nim ?? "",
  }));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manajemen Mahasiswa</h1>
        <SubmitButton
          text="Tambah Mahasiswa"
          href="/admin/manajemen-akademik/mahasiswa/create"
          icon={<BsPlusCircleDotted />}
          className="bg-white dark:bg-black/50 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-black/10 hover:transition-all text-sm border border-gray-300 dark:border-gray-800 flex items-center gap-2 cursor-pointer"
        />
      </div>

      <MahasiswaTable
        data={cleanedMahasiswa}
        filters={{
          semesters,
          prodis,
          golongans,
          current: { semester, prodi, golongan, nim },
        }}
      />
    </div>
  );
}
