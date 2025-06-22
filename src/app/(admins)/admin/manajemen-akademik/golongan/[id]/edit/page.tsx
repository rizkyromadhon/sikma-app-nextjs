import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditGolonganForm from "./EditGolonganForm";

export const dynamic = "force-dynamic";

async function getGolonganById(id: string) {
  const golongan = await prisma.golongan.findUnique({
    where: { id: id },
    include: {
      prodi: true,
      semester: true,
    },
  });

  if (!golongan) {
    notFound();
  }
  return golongan;
}

async function getAllProdi() {
  return await prisma.programStudi.findMany({
    orderBy: { name: "asc" },
  });
}

async function getAllSemester() {
  return await prisma.semester.findMany({
    orderBy: { name: "asc" },
  });
}

export default async function EditGolonganPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const [golongan, prodiList, semesterList] = await Promise.all([
    getGolonganById(id),
    getAllProdi(),
    getAllSemester(),
  ]);

  return (
    <div className="w-full max-w-2xl mt-10 mx-auto p-8 bg-white dark:bg-black/20 rounded-md shadow-[0_0_10px_1px_#1a1a1a1a] dark:shadow-[0_0_20px_1px_#ffffff1a]">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Edit Golongan {golongan.name} - {golongan.prodi.name} - {golongan?.semester?.name}
      </h1>

      <EditGolonganForm golongan={golongan} prodiList={prodiList} semesterList={semesterList} />
    </div>
  );
}
