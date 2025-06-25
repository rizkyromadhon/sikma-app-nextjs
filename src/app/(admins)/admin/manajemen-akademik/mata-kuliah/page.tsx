import prisma from "@/lib/prisma";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { BsPlusCircleDotted } from "react-icons/bs";
import RuanganTable from "./MatkulTable";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";

const ITEMS_PER_PAGE = 5;

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
            <BreadcrumbPage>Mata Kuliah</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Manajemen Mata Kuliah</h1>

      <RuanganTable data={data} initialSearch={search} totalPages={totalPages} currentPage={currentPage} />
    </div>
  );
}
