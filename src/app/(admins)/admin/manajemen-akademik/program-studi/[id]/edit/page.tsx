import { notFound } from "next/navigation";
import EditProdiForm from "./EditProdiForm";
import prisma from "@/lib/prisma";

async function getProdiById(id: string) {
  const prodi = await prisma.programStudi.findUnique({ where: { id: id } });
  if (!prodi) notFound();
  return prodi;
}

export default async function EditProdiPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const prodi = await getProdiById(id);
  return (
    <div className="w-full max-w-2xl mt-10 mx-auto p-8 bg-white dark:bg-black/20 rounded-md shadow-[0_0_10px_1px_#1a1a1a1a] dark:shadow-[0_0_20px_1px_#ffffff1a]">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Program Studi</h1>
      <EditProdiForm prodi={prodi} />
    </div>
  );
}
