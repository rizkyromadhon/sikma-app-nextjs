import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { BsPlusCircleDotted } from "react-icons/bs";
import JadwalKuliahTable from "./JadwalKuliahTable";
import { Prisma } from "@/generated/prisma/client";

// Tentukan jumlah item per halaman
const ITEMS_PER_PAGE = 6;

async function getJadwalData(
  adminProdiId: string,
  filters: { semester?: string; golongan?: string; search?: string },
  page: number
) {
  const where: Prisma.JadwalKuliahWhereInput = {
    prodiId: adminProdiId,
  };

  if (filters.semester && !isNaN(parseInt(filters.semester))) {
    where.semesterId = filters.semester;
  }
  if (filters.golongan) {
    where.golongans = {
      some: {
        id: filters.golongan,
      },
    };
  }
  if (filters.search) {
    where.OR = [
      { mata_kuliah: { name: { contains: filters.search, mode: "insensitive" } } },
      { dosen: { name: { contains: filters.search, mode: "insensitive" } } },
      { ruangan: { kode: { contains: filters.search, mode: "insensitive" } } },
    ];
  }

  const [jadwalKuliah, totalCount] = await Promise.all([
    prisma.jadwalKuliah.findMany({
      where,
      take: ITEMS_PER_PAGE,
      skip: (page - 1) * ITEMS_PER_PAGE,
      include: {
        dosen: { select: { name: true } },
        mata_kuliah: { select: { name: true } },
        semester: { select: { name: true } },
        golongans: { select: { name: true } },
        ruangan: { select: { name: true, kode: true } },
        prodi: { select: { name: true } },
      },
      orderBy: [{ hari: "asc" }, { jam_mulai: "asc" }],
    }),
    prisma.jadwalKuliah.count({ where }),
  ]);

  const [semesters, golongans] = await Promise.all([
    prisma.semester.findMany({ orderBy: { name: "asc" } }),
    prisma.golongan.findMany({
      where: {
        prodiId: adminProdiId,
        ...(filters.semester && !isNaN(parseInt(filters.semester)) ? { semesterId: filters.semester } : {}),
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return { jadwalKuliah, semesters, golongans, totalPages };
}

// Komponen Halaman Utama
export default async function ManajemenJadwalPage({
  searchParams,
}: {
  searchParams: Promise<{
    semester?: string;
    golongan?: string;
    search?: string;
    page?: string;
    prodi?: string;
  }>;
}) {
  const session = await auth();
  const { semester, golongan, search, page } = await searchParams;

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/login?error=unauthorized");
  }

  const adminUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { prodiId: true },
  });

  if (!adminUser || !adminUser.prodiId) {
    return (
      <div className="p-8 text-center">
        <p className="text-xl text-red-500">
          Akses ditolak: Akun admin Anda tidak terasosiasi dengan Program Studi manapun.
        </p>
      </div>
    );
  }

  const adminProdiId = adminUser.prodiId;

  // PERBAIKAN 3: Ambil 'page' dari searchParams
  const currentPage = Number(page) || 1;

  // Panggil getJadwalData dengan semua parameter yang dibutuhkan
  const { jadwalKuliah, semesters, golongans, totalPages } = await getJadwalData(
    adminProdiId,
    { semester, golongan, search },
    currentPage
  );

  // Buat data serializable sebelum dikirim ke client
  const serializableJadwalKuliah = jadwalKuliah.map((jadwal) => ({
    ...jadwal,
    jam_mulai: jadwal.jam_mulai.toISOString(),
    jam_selesai: jadwal.jam_selesai.toISOString(),
  }));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Manajemen Jadwal Kuliah</h1>
        <SubmitButton
          text="Tambah Jadwal Kuliah"
          href="/admin/manajemen-akademik/jadwal-kuliah/create"
          icon={<BsPlusCircleDotted />}
          className="bg-white dark:bg-black/50 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-full text-sm border border-gray-300 dark:border-gray-800 hover:bg-gray-200 dark:hover:bg-black/20 flex items-center gap-2"
        />
      </div>

      <JadwalKuliahTable
        data={serializableJadwalKuliah}
        totalPages={totalPages}
        currentPage={currentPage}
        prodiId={adminProdiId}
        filters={{
          semesters: semesters.map((s) => ({ id: s.id.toString(), name: s.name })),
          golongans: golongans.map((g) => ({ id: g.id.toString(), name: g.name })),
          current: { semester, golongan, search },
        }}
      />
    </div>
  );
}
