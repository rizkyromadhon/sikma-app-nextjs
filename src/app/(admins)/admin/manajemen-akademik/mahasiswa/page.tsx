import prisma from "@/lib/prisma";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { BsPlusCircleDotted } from "react-icons/bs";
import MahasiswaTable from "./MahasiswaTable";
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

// Fungsi ini sekarang menerima parameter halaman (page)
async function getMahasiswaData(
  filters: { semester?: string; prodi?: string; golongan?: string; nim?: string },
  page: number
) {
  const where: Prisma.UserWhereInput = {
    role: "MAHASISWA",
    nim: { not: null },
  };

  if (filters.semester) where.semesterId = filters.semester;
  if (filters.prodi) where.prodiId = filters.prodi;
  if (filters.golongan) where.golonganId = filters.golongan;
  if (filters.nim) where.nim = { contains: filters.nim, mode: "insensitive" };

  const [mahasiswa, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      take: ITEMS_PER_PAGE,
      skip: (page - 1) * ITEMS_PER_PAGE, // Lewati item dari halaman sebelumnya
      include: {
        prodi: true,
        golongan: true,
        semester: true,
      },
      orderBy: { name: "asc" },
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return { mahasiswa, totalPages };
}

async function getFilterOptions() {
  const [semesters, prodis, golongans] = await Promise.all([
    prisma.semester.findMany({ orderBy: { name: "asc" } }),
    prisma.programStudi.findMany({ orderBy: { name: "asc" } }),
    prisma.golongan.findMany({
      select: { id: true, name: true, prodiId: true, semesterId: true },
      orderBy: { name: "asc" },
    }),
  ]);
  return { semesters, prodis, golongans };
}

export default async function ManageMahasiswaPage({
  searchParams,
}: {
  searchParams?: Promise<{
    semester?: string;
    prodi?: string;
    golongan?: string;
    nim?: string;
    page?: string;
  }>;
}) {
  const { semester, prodi, golongan, nim, page } = (await searchParams) || {};
  const currentPage = Number(page) || 1;

  // Panggil fungsi dengan filter dan halaman saat ini
  const { mahasiswa, totalPages } = await getMahasiswaData({ semester, prodi, golongan, nim }, currentPage);

  const { semesters, prodis, golongans } = await getFilterOptions();

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
            <BreadcrumbPage>Mahasiswa</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Mahasiswa</h1>
        <SubmitButton
          text="Tambah Mahasiswa"
          href="/admin/manajemen-akademik/mahasiswa/create"
          icon={<BsPlusCircleDotted />}
          className="bg-white dark:bg-neutral-950/50 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-full text-sm border border-gray-300 dark:border-neutral-800 hover:bg-gray-200 dark:hover:bg-black/20 flex items-center gap-2 cursor-pointer"
        />
      </div>

      <MahasiswaTable
        data={mahasiswa}
        totalPages={totalPages}
        currentPage={currentPage}
        filters={{
          semesters: semesters.map((s) => ({ id: s.id.toString(), name: s.name })),
          prodis: prodis.map((p) => ({ id: p.id.toString(), name: p.name })),
          golongans: golongans.map((g) => ({
            id: g.id.toString(),
            name: g.name,
            prodiId: g.prodiId.toString(),
            semesterId: g.semesterId.toString(),
          })),
          current: { semester, prodi, golongan, nim },
        }}
      />
    </div>
  );
}
