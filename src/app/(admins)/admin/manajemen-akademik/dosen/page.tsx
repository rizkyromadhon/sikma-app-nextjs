import prisma from "@/lib/prisma";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { BsPlusCircleDotted } from "react-icons/bs";
import DosenTable from "./DosenTable";
import { Prisma } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

const ITEMS_PER_PAGE = 6;

async function getDosen(prodiId?: string, nip?: string, page: number = 1) {
  const whereClause: Prisma.UserWhereInput = {
    role: "DOSEN",
    nip: { not: null },
  };

  if (prodiId) {
    whereClause.prodiId = prodiId;
  }
  if (nip) {
    whereClause.nip = { contains: nip, mode: "insensitive" };
  }

  const [data, totalCount] = await Promise.all([
    prisma.user.findMany({
      where: whereClause,
      take: ITEMS_PER_PAGE,
      skip: (page - 1) * ITEMS_PER_PAGE,
      include: {
        prodi: true,
      },
      orderBy: { name: "asc" },
    }),
    prisma.user.count({ where: whereClause }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return { data, totalPages };
}

async function getAllProdi() {
  return await prisma.programStudi.findMany({ orderBy: { name: "asc" } });
}

export default async function ManajemenDosenPage({
  searchParams,
}: {
  searchParams: { prodi?: string; nip?: string; page?: number };
}) {
  const { prodi, nip, page } = (await searchParams) || {};
  const currentPage = (await page) || 1;
  // const currentPage = Number(searchParams?.page) || 1;

  const [{ data, totalPages }, prodis] = await Promise.all([
    getDosen(prodi, nip, currentPage),
    getAllProdi(),
  ]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manajemen Dosen</h1>
        <SubmitButton
          text="Tambah Dosen"
          href="/admin/manajemen-akademik/dosen/create"
          icon={<BsPlusCircleDotted />}
          className="bg-white dark:bg-black/50 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-black/10 hover:transition-all text-sm border border-gray-300 dark:border-gray-800 flex items-center gap-2"
        />
      </div>

      <DosenTable
        data={data}
        totalPages={totalPages}
        currentPage={currentPage}
        filters={{
          prodis: prodis.map((p) => ({ id: p.id, name: p.name })),
          current: { prodi, nip },
        }}
      />
    </div>
  );
}
