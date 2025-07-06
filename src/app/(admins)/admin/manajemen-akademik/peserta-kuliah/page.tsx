import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { BsPlusCircleDotted } from "react-icons/bs";
import PesertaKuliahTable from "./PesertaKuliahTable";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { Prisma } from "@/generated/prisma/client";

export default async function ManajemenPesertaPage() {
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
          Akses ditolak: Akun admin Anda tidak terasosiasi dengan Program Studi manapun.
        </p>
      </div>
    );
  }

  const adminProdiId = adminUser.prodiId;

  const [pesertaList, semesters, mataKuliahs, ruangans] = await Promise.all([
    prisma.pesertaKuliah.findMany({
      where: { jadwal_kuliah: { is: { prodiId: adminProdiId } }, mahasiswa: { role: "MAHASISWA" } },
      include: {
        mahasiswa: {
          select: {
            id: true,
            name: true,
            nim: true,
            semester: { select: { id: true, name: true } },
            golongan: { select: { id: true, name: true } },
          },
        },
        jadwal_kuliah: {
          select: {
            id: true,
            mata_kuliah: { select: { name: true, id: true } },
            semester: { select: { name: true, id: true } },
            ruangan: { select: { name: true, id: true } },
            golongans: { select: { name: true, id: true } },
          },
        },
      },
      orderBy: [{ createdAt: "desc" }],
    }),
    prisma.semester.findMany({ orderBy: { name: "asc" } }),
    prisma.mataKuliah.findMany({
      where: { jadwal_kuliah: { some: { prodiId: adminProdiId } } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.ruangan.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
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
            <Link href="#">Manajemen Akademik</Link>
          </BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Peserta Kuliah</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manajemen Peserta Kuliah</h1>
        <SubmitButton
          text="Tambah Peserta Kuliah"
          href="/admin/manajemen-akademik/peserta-kuliah/create"
          icon={<BsPlusCircleDotted />}
          className="bg-white dark:bg-neutral-950/50 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-black/10 hover:transition-all text-sm border border-gray-300 dark:border-neutral-800 flex items-center gap-2"
        />
      </div>

      <PesertaKuliahTable
        data={pesertaList}
        prodiId={adminProdiId}
        filters={{
          semesters: semesters.map((s) => ({ id: s.id.toString(), name: s.name })),
          mataKuliahs: mataKuliahs.map((m) => ({ id: m.id.toString(), name: m.name })),
          ruangans: ruangans.map((r) => ({ id: r.id.toString(), name: r.name })),
        }}
      />
    </div>
  );
}
