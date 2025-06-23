import prisma from "@/lib/prisma";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { BsPlusCircleDotted } from "react-icons/bs";
import GolonganTable from "./GolonganTable";
import { Prisma } from "@/generated/prisma";

const ITEMS_PER_PAGE = 6;

async function getGolongan(prodiId: string | undefined, semesterId: string | undefined, page: number) {
  const whereClause: Prisma.GolonganWhereInput = {
    semester: { isNot: null },
  };

  if (prodiId) {
    whereClause.prodiId = prodiId;
  }
  if (semesterId) {
    whereClause.semesterId = semesterId;
  }

  const [data, totalCount] = await Promise.all([
    prisma.golongan.findMany({
      where: whereClause,
      take: ITEMS_PER_PAGE,
      skip: (page - 1) * ITEMS_PER_PAGE,
      orderBy: {
        name: "asc",
      },
      include: {
        prodi: true,
        semester: true,
      },
    }),
    prisma.golongan.count({ where: whereClause }),
  ]);

  return { data, currentPage: page, totalPages: Math.ceil(totalCount / ITEMS_PER_PAGE) };
}

async function getAllProdi() {
  return await prisma.programStudi.findMany({ orderBy: { name: "asc" } });
}

async function getAllSemester() {
  return await prisma.semester.findMany({ orderBy: { name: "asc" } });
}

export default async function ManajemenGolonganPage({
  searchParams,
}: {
  searchParams: Promise<{ prodi?: string; semester?: string; page?: string }>;
}) {
  const params = await searchParams;
  const { prodi, semester, page } = params;
  const prodiId = prodi || undefined;
  const semesterId = semester || undefined;
  const currentPage = Number(page || 1);

  const [{ data, totalPages }, prodiList, semesterList] = await Promise.all([
    getGolongan(prodiId, semesterId, currentPage),
    getAllProdi(),
    getAllSemester(),
  ]);

  return (
    <div className="w-full mx-auto p-6 bg-white dark:bg-black/20 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white ">Manajemen Golongan</h1>
        <SubmitButton
          text="Tambah Golongan"
          href="/admin/manajemen-akademik/golongan/create"
          icon={<BsPlusCircleDotted />}
          className="bg-white dark:bg-black/50 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-black/10 hover:transition-all text-sm border border-gray-300 dark:border-gray-800 flex items-center gap-2 cursor-pointer"
        />
      </div>
      <GolonganTable
        initialData={data}
        totalPages={totalPages}
        currentPage={currentPage}
        prodiList={prodiList}
        currentProdiFilter={prodiId}
        semesterList={semesterList}
        currentSemesterFilter={semesterId}
      />
    </div>
  );
}
