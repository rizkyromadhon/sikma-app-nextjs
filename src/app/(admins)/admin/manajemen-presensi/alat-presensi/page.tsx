import prisma from "@/lib/prisma";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { BsPlusCircleDotted } from "react-icons/bs";
import AlatPresensiTable from "./AlatPresensiTable";
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

async function getAlatPresensi(search?: string) {
  const where: Prisma.AlatPresensiWhereInput = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { ruangan: { kode: { contains: search, mode: "insensitive" } } },
    ];
  }

  const data = await prisma.alatPresensi.findMany({
    where,
    include: {
      ruangan: { select: { kode: true, name: true } },
    },
    orderBy: { name: "asc" },
  });

  return data;
}

export default async function ManajemenAlatPresensiPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;
  const searchParms = search;
  const data = await getAlatPresensi(searchParms);

  const serializableData = data.map((item) => ({
    ...item,
    jadwal_nyala: item.jadwal_nyala?.toISOString() || null,
    jadwal_mati: item.jadwal_mati?.toISOString() || null,
  }));

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
            <BreadcrumbPage>Alat Presensi</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Manajemen Alat Presensi</h1>
      <AlatPresensiTable data={serializableData} initialSearch={search} />
    </div>
  );
}
