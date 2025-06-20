// app/(admins)/admin/manajemen-akademik/golongan/[id]/edit/EditGolonganForm.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Golongan, ProgramStudi as Prodi } from "@/generated/prisma/client";
import { SubmitButton } from "@/components/auth/SubmitButton";

// Tipe data untuk prop, termasuk data relasi 'prodi'
type GolonganWithProdi = Golongan & {
  prodi: Prodi;
};

interface EditGolonganFormProps {
  golongan: GolonganWithProdi;
  prodiList: Prodi[];
}

export default function EditGolonganForm({ golongan, prodiList }: EditGolonganFormProps) {
  // Inisialisasi state form dengan data yang diterima dari props
  const [form, setForm] = useState({
    name: golongan.name,
    prodiId: golongan.prodiId, // prodiId sudah terisi
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
          prodiId: form.prodiId, // prodiId adalah string, sudah benar
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal menyimpan perubahan.");

      router.push("/admin/manajemen-akademik/golongan?golongan=update_success");
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
        {/* Dropdown Program Studi */}
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
            value={form.prodiId} // Value ter-set ke prodiId dari golongan
            onChange={(e) => setForm({ ...form, prodiId: e.target.value })}
            className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-black/50 dark:text-white border-gray-300 dark:border-gray-800 text-sm focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
            required
          >
            {/* Opsi dropdown di-render dari prodiList */}
            {prodiList.map((prodi) => (
              <option key={prodi.id} value={prodi.id} className="bg-white dark:bg-black/90">
                {prodi.name}
              </option>
            ))}
          </select>
        </div>

        {/* Input Nama Golongan */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nama Golongan
          </label>
          <input
            id="name"
            name="name"
            value={form.name} // Value ter-set ke nama dari golongan
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Golongan A"
            autoComplete="off"
            className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-black/50 dark:text-white border-gray-300 dark:border-gray-800 text-sm focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
            required
          />
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
            href="/admin/manajemen-akademik/golongan"
            className="bg-white dark:bg-black text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-black/10 px-6 py-2 rounded text-sm border border-gray-300 dark:border-gray-800 hover:transition-all"
          />
        </div>
      </div>
    </form>
  );
}
