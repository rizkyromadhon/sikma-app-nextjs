import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditSemesterForm from "./EditSemesterForm";

async function getSemesterById(id: string) {
  // const numericId = parseInt(id, 10);

  // if (isNaN(numericId)) {
  //   notFound();
  // }

  const semester = await prisma.semester.findUnique({
    where: { id: id },
  });

  if (!semester) notFound();
  return semester;
}

export default async function EditSemesterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const semester = await getSemesterById(id);

  return (
    <div className="w-full max-w-2xl mt-10 mx-auto p-8 bg-white dark:bg-black/20 rounded-md shadow-[0_0_10px_1px_#1a1a1a1a] dark:shadow-[0_0_20px_1px_#ffffff1a]">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit {semester.name}</h1>
      <EditSemesterForm semester={semester} />
    </div>
  );
}
