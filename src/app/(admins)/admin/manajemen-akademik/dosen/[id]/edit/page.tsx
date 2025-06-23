import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditDosenForm from "./EditDosenForm";

async function getFormData(dosenId: string) {
  const [user, prodis] = await Promise.all([
    prisma.user.findUnique({
      where: { id: dosenId },
      select: {
        id: true,
        name: true,
        nip: true,
        email: true,
        no_hp: true,
        alamat: true,
        gender: true,
        foto: true,
        prodiId: true,
      },
    }),
    prisma.programStudi.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!user) {
    notFound();
  }

  return { user, prodis };
}
type Params = Promise<{ id: string }>;

export default async function EditDosenPage({ params }: { params: Params }) {
  const { id } = await params;

  const { user, prodis } = await getFormData(id);

  return <EditDosenForm dosen={user} prodis={prodis.map((p) => ({ id: p.id, name: p.name }))} />;
}
