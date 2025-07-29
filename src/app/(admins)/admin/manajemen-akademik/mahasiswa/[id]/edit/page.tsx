import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditMahasiswaForm from "./EditMahasiswaForm";

async function getFormData(mahasiswaId: string) {
  const [user, semesters, prodis, golongans] = await Promise.all([
    prisma.user.findUnique({
      where: { id: mahasiswaId },
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
    prisma.golongan.findMany({
      select: { id: true, name: true, prodiId: true, semesterId: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!user) {
    notFound();
  }

  return { user, semesters, prodis, golongans };
}

export default async function EditMahasiswaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, semesters, prodis, golongans } = await getFormData(id);

  return (
    <EditMahasiswaForm
      mahasiswa={user}
      semesters={semesters.map((s) => ({ id: s.id.toString(), name: s.name }))}
      prodis={prodis.map((p) => ({ id: p.id, name: p.name }))}
      golongans={golongans.map((g) => ({
        id: g.id,
        name: g.name,
        prodiId: g.prodiId,
        semesterId: g.semesterId.toString(),
      }))}
    />
  );
}
