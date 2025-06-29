import prisma from "@/lib/prisma";
import DosenTable from "./DosenTable";
import { Prisma } from "@/generated/prisma/client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";

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
  searchParams: Promise<{ prodi?: string; nip?: string; page?: number }>;
}) {
  const { prodi, nip, page } = await searchParams;
  const currentPage = page ?? 1;

  const [{ data, totalPages }, prodis] = await Promise.all([
    getDosen(prodi, nip, currentPage),
    getAllProdi(),
  ]);

  return (
    <div className="p-6">
      <Breadcrumb className="ml-12 mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/admin/dashboard">Admin</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbLink asChild>
            <Link href="#">Manajemen Akademik</Link>
          </BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Dosen</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Dosen</h1>
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
