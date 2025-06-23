// app/(admins)/admin/manajemen-presensi/registrasi-rfid/page.tsx

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import RfidTable from "./RfidTable"; // Komponen tabel yang akan kita buat
import { Prisma } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

const ITEMS_PER_PAGE = 15;

// Fungsi untuk mengambil data mahasiswa dengan filter dan pagination
async function getMahasiswa(adminProdiId: string, search?: string, statusRfid?: string, page: number = 1) {
  const where: Prisma.UserWhereInput = {
    role: "MAHASISWA",
    prodiId: adminProdiId,
  };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { nim: { contains: search, mode: "insensitive" } },
    ];
  }

  if (statusRfid === "terdaftar") {
    where.uid = { not: null };
  } else if (statusRfid === "belum_terdaftar") {
    where.uid = null;
  }

  const [data, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      take: ITEMS_PER_PAGE,
      skip: (page - 1) * ITEMS_PER_PAGE,
      select: {
        // Pilih hanya data yang dibutuhkan untuk tabel
        id: true,
        nim: true,
        name: true,
        uid: true, // WAJIB: ambil UID untuk logika tombol
        semester: { select: { name: true } },
        golongan: { select: { name: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  return { data, totalPages, currentPage: page };
}

export default async function RegistrasiRfidPage({
  searchParams,
}: {
  searchParams?: { search?: string; page?: string; statusRfid?: string };
}) {
  const session = await auth();
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
          Akses ditolak: Akun admin tidak terasosiasi dengan Program Studi.
        </p>
      </div>
    );
  }
  const { search, statusRfid, page } = (await searchParams) || {};
  const currentPage = Number(page) || 1;
  const { data, totalPages } = await getMahasiswa(adminUser.prodiId, search, statusRfid, currentPage);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Registrasi Kartu RFID</h1>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 -mt-4 mb-6">
        Daftar mahasiswa dari program studi Anda. Klik &quot;Registrasi&quot; untuk memulai proses pemindaian
        kartu RFID untuk mahasiswa yang belum terdaftar.
      </p>
      <RfidTable
        data={data}
        totalPages={totalPages}
        currentPage={currentPage}
        initialSearch={search}
        initialStatusFilter={statusRfid}
      />
    </div>
  );
}
