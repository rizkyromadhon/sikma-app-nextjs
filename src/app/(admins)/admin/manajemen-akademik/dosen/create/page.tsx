import prisma from "@/lib/prisma";
import CreateDosenForm from "@/app/(admins)/admin/manajemen-akademik/dosen/create/CreateDosenForm";

export default async function CreateDosenPage() {
  const [prodis] = await Promise.all([prisma.programStudi.findMany({ orderBy: { name: "asc" } })]);

  return (
    <div>
      <CreateDosenForm prodis={prodis.map((p) => ({ id: p.id.toString(), name: p.name }))} />
    </div>
  );
}
