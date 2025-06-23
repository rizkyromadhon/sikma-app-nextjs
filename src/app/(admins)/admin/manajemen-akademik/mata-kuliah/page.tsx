import prisma from "@/lib/prisma";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { BsPlusCircleDotted } from "react-icons/bs";
import RuanganTable from "./MatkulTable";

const ITEMS_PER_PAGE = 6;

async function getMatkul(search?: string, page: number = 1) {
  const whereClause = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { kode: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};
  const [data, totalCount] = await Promise.all([
    prisma.mataKuliah.findMany({
      where: whereClause,
      take: ITEMS_PER_PAGE,
      skip: (page - 1) * ITEMS_PER_PAGE,
      orderBy: { kode: "asc" },
    }),
    prisma.mataKuliah.count({
      where: whereClause,
    }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  return { data, totalPages, currentPage: page };
}

export default async function ManajemenMatkulPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const { search = "", page = "1" } = await searchParams;
  const { data, totalPages, currentPage } = await getMatkul(search, Number(page));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manajemen Mata Kuliah</h1>
        <SubmitButton
          text="Tambah Mata Kuliah"
          href="/admin/manajemen-akademik/mata-kuliah/create"
          icon={<BsPlusCircleDotted />}
          className="bg-white dark:bg-black/50 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-black/10 hover:transition-all text-sm border border-gray-300 dark:border-gray-800 flex items-center gap-2"
        />
      </div>
      <RuanganTable data={data} initialSearch={search} totalPages={totalPages} currentPage={currentPage} />
    </div>
  );
}
