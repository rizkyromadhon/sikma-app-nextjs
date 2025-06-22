import { SubmitButton } from "@/components/auth/SubmitButton";
import ProdiTable from "./ProdiTable";
import { BsPlusCircleDotted } from "react-icons/bs";
import prisma from "@/lib/prisma";

async function getProdi() {
  const prodi = await prisma.programStudi.findMany({
    orderBy: {
      id: "asc",
    },
  });
  return prodi;
}

export default async function ManajemenProdiPage() {
  const data = await getProdi();

  return (
    <div className="w-full mx-auto p-6 bg-white dark:bg-black/20 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Program Studi</h1>
        <SubmitButton
          text="Tambah Program Studi"
          href="/admin/manajemen-akademik/program-studi/create"
          icon={<BsPlusCircleDotted />}
          className="bg-white dark:bg-black/50 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-black/10 hover:transition-all text-sm border border-gray-300 dark:border-gray-800 flex items-center gap-2 cursor-pointer"
        />
      </div>
      <ProdiTable data={data} />
    </div>
  );
}
