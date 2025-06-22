// app/(admins)/admin/manajemen-akademik/mahasiswa/[id]/edit/page.tsx

import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditDosenForm from "./EditDosenForm";

export const dynamic = "force-dynamic";

// Fungsi untuk mengambil semua data yang diperlukan untuk form
async function getFormData(dosenId: string) {
  const [user, prodis] = await Promise.all([
    prisma.user.findUnique({
      where: { id: dosenId },
      // Sertakan relasi untuk mendapatkan ID yang sudah ada
      select: {
        id: true,
        name: true,
        nip: true,
        email: true,
        no_hp: true,
        alamat: true,
        gender: true,
        foto: true,
        prodiId: true,
      },
    }),
    prisma.programStudi.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!user) {
    notFound();
  }

  return { user, prodis };
}

export default async function EditMahasiswaPage({ params }: { params: { id: string } }) {
  const { user, prodis } = await getFormData(params.id);

  return <EditDosenForm dosen={user} prodis={prodis.map((p) => ({ id: p.id, name: p.name }))} />;
}
