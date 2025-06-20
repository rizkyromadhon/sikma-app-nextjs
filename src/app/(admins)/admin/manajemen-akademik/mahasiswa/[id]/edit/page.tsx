// app/(admins)/admin/manajemen-akademik/mahasiswa/[id]/edit/page.tsx

import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditMahasiswaForm from "./EditMahasiswaForm";

export const dynamic = "force-dynamic";

// Fungsi untuk mengambil semua data yang diperlukan untuk form
async function getFormData(mahasiswaId: string) {
  const [user, semesters, prodis, golongans] = await Promise.all([
    prisma.user.findUnique({
      where: { id: mahasiswaId },
      // Sertakan relasi untuk mendapatkan ID yang sudah ada
      select: {
        id: true,
        name: true,
        nim: true,
        email: true,
        no_hp: true,
        alamat: true,
        gender: true,
        foto: true,
        semesterId: true,
        prodiId: true,
        golonganId: true,
      },
    }),
    prisma.semester.findMany({ orderBy: { name: "asc" } }),
    prisma.programStudi.findMany({ orderBy: { name: "asc" } }),
    prisma.golongan.findMany({ select: { id: true, name: true, prodiId: true } }),
  ]);

  if (!user) {
    notFound();
  }

  return { user, semesters, prodis, golongans };
}

export default async function EditMahasiswaPage({ params }: { params: { id: string } }) {
  const { user, semesters, prodis, golongans } = await getFormData(params.id);

  return (
    <EditMahasiswaForm
      mahasiswa={user}
      semesters={semesters.map((s) => ({ id: s.id.toString(), name: s.name }))}
      prodis={prodis.map((p) => ({ id: p.id, name: p.name }))}
      golongans={golongans.map((g) => ({ id: g.id, name: g.name, prodiId: g.prodiId }))}
    />
  );
}
