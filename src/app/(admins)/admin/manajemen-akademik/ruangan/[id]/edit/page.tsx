import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditRuanganForm from "./EditRuanganForm";

async function getRuanganById(id: string) {
  const ruangan = await prisma.ruangan.findUnique({
    where: { id: id },
  });
  if (!ruangan) {
    notFound();
  }
  return ruangan;
}

export default async function EditRuanganPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const ruangan = await getRuanganById(id);

  return (
    <div className="w-full max-w-2xl mt-10 mx-auto p-8 bg-white dark:bg-black/20 rounded-md shadow-[0_0_10px_1px_#1a1a1a1a] dark:shadow-[0_0_20px_1px_#ffffff1a]">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Ruangan</h1>
      <EditRuanganForm ruangan={ruangan} />
    </div>
  );
}
