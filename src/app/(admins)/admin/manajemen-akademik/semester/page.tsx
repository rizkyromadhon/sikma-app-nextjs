import { auth } from "@/auth"; // Untuk autentikasi admin
import { redirect } from "next/navigation"; // Untuk redirect
import { getAllSemesters } from "@/lib/data"; // Fungsi baru untuk ambil data semester

import SemesterTable from "@/components/admin/manajemen-akademik/semester/SemesterTable";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { BsPlusCircleDotted } from "react-icons/bs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";

const ManageSemesterPage = async () => {
  const session = await auth();
  if (!session || !session.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const semesters = await getAllSemesters();

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
            <BreadcrumbPage>Semester</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Semester</h1>
        <SubmitButton
          text="Tambah Semester"
          href="/admin/manajemen-akademik/semester/create"
          icon={<BsPlusCircleDotted />}
          className="bg-white dark:bg-neutral-950/50 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-black/10 hover:transition-all text-sm border border-gray-300 dark:border-neutral-800 flex items-center gap-2 cursor-pointer"
        />
      </div>

      <SemesterTable data={semesters} />
    </div>
  );
};

export default ManageSemesterPage;
