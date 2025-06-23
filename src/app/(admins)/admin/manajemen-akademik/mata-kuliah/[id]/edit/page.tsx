import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditMatkulForm from "./EditMatkulForm";

async function getMatkulById(id: string) {
  const matkul = await prisma.mataKuliah.findUnique({
    where: { id: id },
  });
  if (!matkul) {
    notFound();
  }
  return matkul;
}

export default async function EditMatkulPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const matkul = await getMatkulById(id);

  return (
    <div className="w-full max-w-2xl mt-10 mx-auto p-8 bg-white dark:bg-black/20 rounded-md shadow-[0_0_10px_1px_#1a1a1a1a] dark:shadow-[0_0_20px_1px_#ffffff1a]">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Mata Kuliah</h1>
      <EditMatkulForm matkul={matkul} />
    </div>
  );
}
