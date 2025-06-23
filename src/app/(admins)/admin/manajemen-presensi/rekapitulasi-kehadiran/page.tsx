import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import RekapTable from "./RekapTable";
import { Prisma } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

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
  searchParams?: { semester?: string; golongan?: string; search?: string; page?: string };
}) {
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

  const page = Number(searchParams?.page) || 1;
  const [result, filterOptions] = await Promise.all([
    getMahasiswa(admin.prodiId, searchParams || {}, page),
    getFilterOptions(admin.prodiId),
  ]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Rekap Kehadiran Mahasiswa</h1>
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
          current: searchParams || {},
        }}
        currentPage={page}
        totalPages={result.totalPages}
      />
    </div>
  );
}
