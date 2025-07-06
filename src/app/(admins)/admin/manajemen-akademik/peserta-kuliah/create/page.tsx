import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CreatePesertaForm from "./CreatePesertaForm";

async function getInitialData(adminProdiId: string) {
  const semesters = await prisma.semester.findMany({ orderBy: { name: "asc" } });
  return { semesters };
}

export default async function CreatePesertaPage() {
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
          Akses ditolak: Akun admin Anda tidak terasosiasi dengan Program Studi.
        </p>
      </div>
    );
  }

  const formData = await getInitialData(adminUser.prodiId);

  return (
    <div className="w-full max-w-4xl mt-10 mx-auto p-8 bg-white dark:bg-black/20 rounded-md shadow-[0_0_10px_1px_#1a1a1a1a] dark:shadow-[0_0_20px_1px_#ffffff1a]">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Tambah Peserta Kuliah</h1>
      <CreatePesertaForm prodiId={adminUser.prodiId} semesters={formData.semesters} />
    </div>
  );
}
