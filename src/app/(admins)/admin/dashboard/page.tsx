import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { LuUsers, LuUser } from "react-icons/lu";
import StatCard from "@/components/admin/dashboard/StatCard";
import StudentsPerSemesterChart from "@/components/admin/dashboard/StudentsPerSemesterChart";
import StudentsByProdiChart from "@/components/admin/dashboard/StudentsByProdiChart";
import { getTotalStudents, getTotalLecturers, getStudentsPerSemester, getStudentsByProdi } from "@/lib/data";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";

const DashboardAdminPage = async () => {
  const session = await auth();

  if (!session || !session.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      prodi: true,
    },
  });

  if (!user || user.role !== "ADMIN" || !user.prodiId || !user.prodi?.name) {
    return (
      <div className="min-h-screen p-8 bg-[#1E1E1E] text-gray-100 flex items-center justify-center">
        <p className="text-xl text-red-500">
          Akses ditolak atau Program Studi tidak ditemukan untuk admin ini.
        </p>
      </div>
    );
  }

  const adminProdiId = user.prodiId;
  const adminProdiName = user.prodi.name;

  const [totalStudents, totalLecturers, studentsPerSemester, studentsByProdi] = await Promise.all([
    getTotalStudents(adminProdiId),
    getTotalLecturers(adminProdiId),
    getStudentsPerSemester(adminProdiId),
    getStudentsByProdi(adminProdiId, adminProdiName),
  ]);

  console.log("Data from getStudentsPerSemester (Server):", studentsPerSemester);
  console.log("Data from getStudentsByProdi (Server):", studentsByProdi);

  return (
    <div className="h-20 p-6 text-gray-900 dark:text-gray-100">
      <div className="ml-12 mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="#">Admin</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <h1 className="text-2xl font-bold mb-2 text-black dark:text-white tracking-tight">Dashboard Admin</h1>
      <p className="text-sm text-gray-900 dark:text-gray-300 mb-8">
        Program Studi - <span className="text-blue-500 dark:text-blue-400">{adminProdiName}</span>
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <StatCard
          title={`Total Mahasiswa ${adminProdiName}`}
          value={totalStudents}
          icon={<LuUsers className="w-7 h-7" />}
        />
        <StatCard
          title={`Total Dosen ${adminProdiName}`}
          value={totalLecturers}
          icon={<LuUser className="w-7 h-7" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <StudentsPerSemesterChart data={studentsPerSemester} />
        <StudentsByProdiChart data={studentsByProdi} />
      </div>
    </div>
  );
};

export default DashboardAdminPage;
