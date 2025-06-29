"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { MataKuliah } from "@/generated/prisma/client";

interface EditMatkulFormProps {
  matkul: MataKuliah;
}

export default function EditMatkulForm({ matkul }: EditMatkulFormProps) {
  const router = useRouter();

  const [form, setForm] = useState({
    name: matkul.name,
    kode: matkul.kode,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const prefix = "MK";
    const nameFormatted = form.name.trimStart();

    const initials = nameFormatted
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .join("");

    const generatedKode = initials ? `${prefix}-${initials}` : prefix;

    setForm((prev) => ({ ...prev, kode: generatedKode }));
  }, [form.name]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/mata-kuliah/${matkul.id}`, {
        method: "PUT",
        body: JSON.stringify({
          kode: form.kode,
          name: form.name,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal menyimpan perubahan.");

      router.push("/admin/manajemen-akademik/mata-kuliah?mata-kuliah=update_success");
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
            Nama Mata Kuliah
          </label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            autoComplete="off"
            placeholder="Contoh: Pemrograman Web"
            className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-neutral-950/40 dark:text-white border-gray-300 dark:border-neutral-800 text-sm placeholder-gray-700/50 dark:placeholder-gray-400/50 focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
            required
          />
        </div>

        <div>
          <label htmlFor="kode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Kode Mata Kuliah (Otomatis)
          </label>
          <input
            id="kode"
            name="kode"
            value={form.kode}
            className="w-full px-4 py-2 border rounded-md bg-gray-200 dark:bg-neutral-950 dark:text-white border-gray-300 dark:border-neutral-800 text-sm focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none cursor-not-allowed"
            readOnly
          />
        </div>

        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

        <div className="flex items-center gap-4 pt-4">
          <SubmitButton
            type="submit"
            text="Simpan"
            isLoading={isLoading}
            className="bg-black dark:bg-white text-white dark:text-gray-900 dark:hover:bg-gray-200 hover:bg-black/80 px-6 py-2 rounded-md text-sm"
          />
          <SubmitButton
            text="Batal"
            href="/admin/manajemen-akademik/mata-kuliah"
            className="bg-white dark:bg-neutral-950/50 text-text-gray-900 dark:white dark:hover:bg-black/10 hover:bg-gray-200 px-6 py-2 rounded-md text-sm border border-gray-300 dark:border-neutral-800"
          />
        </div>
      </div>
    </form>
  );
}
