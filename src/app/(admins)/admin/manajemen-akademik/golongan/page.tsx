import prisma from "@/lib/prisma";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { BsPlusCircleDotted } from "react-icons/bs";
import GolonganTable from "./GolonganTable";
import { Prisma } from "@/generated/prisma";
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
    <div className="w-full mx-auto p-6 rounded-lg shadow">
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
            <BreadcrumbPage>Golongan</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Manajemen Golongan</h1>
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
