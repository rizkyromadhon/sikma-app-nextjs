// app/(admins)/admin/manajemen-akademik/golongan/[id]/edit/EditGolonganForm.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Golongan, ProgramStudi as Prodi, Semester } from "@/generated/prisma/client";
import { SubmitButton } from "@/components/auth/SubmitButton";

// Tipe data untuk prop, termasuk data relasi 'prodi'
type GolonganWithProdi = Golongan & {
  prodi: Prodi;
};

interface EditGolonganFormProps {
  golongan: GolonganWithProdi;
  prodiList: Prodi[];
  semesterList: Semester[];
}

export default function EditGolonganForm({ golongan, prodiList, semesterList }: EditGolonganFormProps) {
  const params = new URLSearchParams(window.location.search);
  const currentPage = params.get("page") || "1";
  const [form, setForm] = useState({
    name: golongan.name,
    prodiId: golongan.prodiId,
    semesterId: golongan.semesterId,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/golongan/${golongan.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          prodiId: form.prodiId,
          semesterId: form.semesterId,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal menyimpan perubahan.");

      router.push("/admin/manajemen-akademik/golongan?page=${currentPage}&golongan=update_success");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="space-y-4 w-full">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nama Golongan
          </label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Golongan A"
            autoComplete="off"
            className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-black/50 dark:text-white border-gray-300 dark:border-gray-800 text-sm focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
            required
          />
        </div>
        <div>
          <label
            htmlFor="semesterId"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Semester
          </label>
          <select
            id="semesterId"
            name="semesterId"
            value={form.semesterId}
            onChange={(e) => setForm({ ...form, semesterId: e.target.value })}
            required
            className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-black/50 dark:text-white border-gray-300 dark:border-gray-800 text-sm focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
          >
            <option value="" disabled className="bg-white dark:bg-black/90">
              Pilih Semester
            </option>
            {semesterList.map((smt) => (
              <option key={smt.id} value={smt.id} className="bg-white dark:bg-black/90">
                {smt.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="prodiId"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Program Studi
          </label>
          <select
            id="prodiId"
            name="prodiId"
            value={form.prodiId}
            onChange={(e) => setForm({ ...form, prodiId: e.target.value })}
            className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-black/50 dark:text-white border-gray-300 dark:border-gray-800 text-sm focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
            required
          >
            {prodiList.map((prodi) => (
              <option key={prodi.id} value={prodi.id} className="bg-white dark:bg-black/90">
                {prodi.name}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}

        <div className="flex items-center gap-4 pt-2">
          <SubmitButton
            type="submit"
            text="Simpan"
            isLoading={isLoading}
            className="bg-black dark:bg-white text-white dark:text-gray-900 px-6 py-2 hover:bg-gray-800 dark:hover:bg-gray-200 rounded text-sm hover:transition-all"
          />
          <SubmitButton
            text="Batal"
            href={`/admin/manajemen-akademik/golongan?page=${currentPage}`}
            className="bg-white dark:bg-black text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-black/10 px-6 py-2 rounded text-sm border border-gray-300 dark:border-gray-800 hover:transition-all"
          />
        </div>
      </div>
    </form>
  );
}
