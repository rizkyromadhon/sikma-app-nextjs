// src/app/detail-presensi/[slug]/page.tsx

import Link from "next/link";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation"; // Untuk handle jika slug tidak ditemukan
import { format } from "date-fns";
import { id as localeID } from "date-fns/locale";
import { LuArrowLeft } from "react-icons/lu";

export default async function DetailPresensiPage({ params }: { params: { slug: string } }) {
  // 1. Ambil data program studi berdasarkan slug untuk mendapatkan nama dan ID-nya
  const prodi = await prisma.programStudi.findUnique({
    where: {
      slug: params.slug,
    },
  });

  if (!prodi) {
    notFound();
  }

  const presensiData = await prisma.presensiKuliah.findMany({
    where: {
      jadwal_kuliah: {
        prodiId: prodi.id,
      },
    },
    include: {
      mahasiswa: {
        include: { golongan: true },
      },
      mata_kuliah: true,
      jadwal_kuliah: {
        include: { ruangan: true, semester: true },
      },
    },
    orderBy: {
      waktu_presensi: "desc",
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white mb-6"
      >
        <LuArrowLeft className="h-4 w-4" />
        Kembali
      </Link>

      <h1 className="text-xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-[#e4e4e4]">
        Detail Presensi <span className="text-[#e4e4e4]">- {prodi.name}</span>
      </h1>

      <div className="mt-8">{/* ... Form filter Anda akan diletakkan di sini ... */}</div>

      <div className="mt-6 overflow-x-auto bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl shadow-md">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Mahasiswa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Mata Kuliah
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Waktu Presensi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {presensiData.length > 0 ? (
              presensiData.map((presensi) => (
                <tr key={presensi.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {presensi.mahasiswa.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{presensi.mahasiswa.nim}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {presensi.mata_kuliah.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {format(new Date(presensi.waktu_presensi), "d MMMM yyyy, HH:mm:ss", { locale: localeID })}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="text-center py-10 text-gray-500 dark:text-gray-400">
                  Belum ada data presensi untuk program studi ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
