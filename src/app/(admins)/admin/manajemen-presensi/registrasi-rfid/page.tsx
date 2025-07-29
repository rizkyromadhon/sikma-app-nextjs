import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import RfidTable from "./RfidTable";
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
    where.uid = {
      not: null,
      notIn: [""],
    };
  } else if (statusRfid === "belum_terdaftar") {
    where.OR = [{ uid: null }, { uid: "" }];
  }

  const [data, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      take: ITEMS_PER_PAGE,
      skip: (page - 1) * ITEMS_PER_PAGE,
      select: {
        id: true,
        nim: true,
        name: true,
        uid: true,
        semester: { select: { name: true } },
        golongan: { select: { name: true } },
      },
      orderBy: [
        {
          uid: {
            sort: "desc",
          },
        },
        {
          name: "asc",
        },
      ],
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  return { data, totalPages, currentPage: page };
}

export default async function RegistrasiRfidPage({
  searchParams,
}: {
  searchParams?: Promise<{ search?: string; page?: string; statusRfid?: string }>;
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
            <BreadcrumbPage>Registrasi RFID</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Registrasi Kartu RFID</h1>
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
