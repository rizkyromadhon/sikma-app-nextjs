import RegistrasiRfidClient from "./RegistrasiRfidClient";
import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { SubmitButton } from "@/components/auth/SubmitButton";

async function getInitialData(mahasiswaId: string, adminProdiId: string) {
  const mahasiswa = await prisma.user.findFirst({
    where: { id: mahasiswaId, prodiId: adminProdiId, role: "MAHASISWA" },
    select: { id: true, name: true, nim: true, uid: true },
  });

  if (!mahasiswa) {
    notFound();
  }

  const alatPresensi = await prisma.alatPresensi.findFirst();
  if (!alatPresensi) {
    throw new Error("Tidak ada alat presensi yang ditemukan di sistem.");
  }

  return { mahasiswa, alatId: alatPresensi.id };
}

export default async function RegistrasiRfidPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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
          Akses ditolak: Akun admin tidak terasosiasi dengan Program Studi.
        </p>
      </div>
    );
  }

  try {
    const { mahasiswa, alatId } = await getInitialData(id, adminUser.prodiId);

    return <RegistrasiRfidClient initialMahasiswa={mahasiswa} alatId={alatId} />;
  } catch (error: unknown) {
    if (error instanceof Error) {
      return (
        <div className="w-full max-w-2xl mt-10 mx-auto p-8 rounded-md shadow">
          <h1 className="text-2xl font-bold text-red-500 mb-6">Terjadi Kesalahan</h1>
          <p className="text-gray-600 dark:text-gray-300">{error.message}</p>
          <div className="mt-6">
            <SubmitButton href="/admin/manajemen-presensi/registrasi-rfid" text="Kembali" />
          </div>
        </div>
      );
    }
  }
}
