import { auth } from "@/auth";
import  prisma  from "@/lib/prisma";
import { redirect } from "next/navigation";
import { LuUsers, LuUser } from "react-icons/lu";
import StatCard from "@/components/admin/dashboard/StatCard";
import StudentsPerSemesterChart from "@/components/admin/dashboard/StudentsPerSemesterChart";
import StudentsByProdiChart from "@/components/admin/dashboard/StudentsByProdiChart";
import { getTotalStudents, getTotalLecturers, getStudentsPerSemester, getStudentsByProdi } from "@/lib/data";

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

  return (
    <div className="h-20 p-8 text-gray-900 dark:text-gray-100">
      <h1 className="text-3xl font-bold mb-4 text-black dark:text-white tracking-tight">Dashboard Admin</h1>
      <p className="text-xl text-gray-900 dark:text-gray-300 mb-8">
        Program Studi - <span className="text-blue-500 dark:text-blue-400">{adminProdiName}</span>
      </p>

      {/* Baris Statistik */}
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

      {/* Baris Grafik Mahasiswa */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <StudentsPerSemesterChart data={studentsPerSemester} />
        <StudentsByProdiChart data={studentsByProdi} />
      </div>
    </div>
  );
};

export default DashboardAdminPage;
