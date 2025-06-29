import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import RekapTable from "./RekapTable";
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

async function getMahasiswa(
  adminProdiId: string,
  filters: { semester?: string; golongan?: string; search?: string },
  page: number
) {
  const where: Prisma.UserWhereInput = {
    role: "MAHASISWA",
    prodiId: adminProdiId,
    ...(filters.semester && filters.semester !== "all" && { semesterId: filters.semester }),
    ...(filters.golongan && filters.semester !== "all" && { golonganId: filters.golongan }),
    ...(filters.search && {
      OR: [
        { name: { contains: filters.search, mode: "insensitive" } },
        { nim: { contains: filters.search, mode: "insensitive" } },
      ],
    }),
  };

  const [mahasiswa, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      take: ITEMS_PER_PAGE,
      skip: (page - 1) * ITEMS_PER_PAGE,
      select: {
        id: true,
        nim: true,
        name: true,
        foto: true,
        semester: { select: { name: true } },
        prodi: { select: { name: true } },
        golongan: { select: { name: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  return { mahasiswa, totalPages };
}

async function getFilterOptions(adminProdiId: string) {
  const [semesters, golongans, mataKuliahs] = await Promise.all([
    prisma.semester.findMany({ orderBy: { name: "asc" } }),
    prisma.golongan.findMany({
      where: { prodiId: adminProdiId },
      select: { id: true, name: true, semesterId: true },
      orderBy: { name: "asc" },
    }),
    prisma.mataKuliah.findMany({ orderBy: { name: "asc" } }),
  ]);
  return { semesters, golongans, mataKuliahs };
}

export default async function RekapKehadiranPage({
  searchParams,
}: {
  searchParams?: Promise<{ semester?: string; golongan?: string; search?: string; page?: string }>;
}) {
  const params = (await searchParams) || {};
  const { semester, golongan, search, page } = params;
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/login?error=unauthorized");
  }

  const admin = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { prodiId: true },
  });
  if (!admin?.prodiId) {
    return <div className="p-8 text-center text-red-500">Admin tidak terkait prodi</div>;
  }

  const filters = { semester, golongan, search };
  const currentPage = Number(page) || 1;
  const [result, filterOptions] = await Promise.all([
    getMahasiswa(admin.prodiId, filters, currentPage),
    getFilterOptions(admin.prodiId),
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
            <Link href="#">Manajemen Presensi</Link>
          </BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Rekapitulasi Kehadiran</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Rekapitulasi Kehadiran Mahasiswa
      </h1>
      <RekapTable
        data={result.mahasiswa}
        filters={{
          semesters: filterOptions.semesters.map((s) => ({ id: s.id, name: s.name })),
          golongans: filterOptions.golongans.map((g) => ({
            id: g.id,
            name: g.name,
            semesterId: g.semesterId,
          })),
          mataKuliahs: filterOptions.mataKuliahs.map((mk) => ({ id: mk.id, name: mk.name })),
          prodiId: admin.prodiId,
          current: params,
        }}
        currentPage={currentPage}
        totalPages={result.totalPages}
      />
    </div>
  );
}
