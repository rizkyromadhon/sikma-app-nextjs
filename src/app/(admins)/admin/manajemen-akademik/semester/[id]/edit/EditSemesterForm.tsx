"use client"; // Komponen ini harus menjadi Client Component

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Semester } from "@/generated/prisma/client";
import { SubmitButton } from "@/components/auth/SubmitButton";

interface EditSemesterFormProps {
  semester: Semester; // Menerima data semester sebagai prop
}

export default function EditSemesterForm({ semester }: EditSemesterFormProps) {
  const [form, setForm] = useState({
    name: semester.name,
    tipe: semester.tipe,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/semester/${semester.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal menyimpan perubahan.");
      }

      router.push("/admin/manajemen-akademik/semester?semester=update_success");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Terjadi kesalahan yang tidak diketahui.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="space-y-4 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="name"
            value={form.name} 
            onChange={handleChange}
            placeholder="Nama Semester"
            className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-black/50 dark:text-white border-gray-300 dark:border-gray-800 text-sm placeholder-gray-700/50 dark:placeholder-gray-400/50 focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
            required
          />
          <select
            name="tipe"
            value={form.tipe} 
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-black/50 dark:text-white border-gray-300 dark:border-gray-800 text-sm placeholder-gray-700/50 dark:placeholder-gray-400/50 focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
            required
          >
            <option value="GANJIL" className="bg-white dark:bg-black/95">
              Ganjil
            </option>
            <option value="GENAP" className="bg-white dark:bg-black/95">
              Genap
            </option>
          </select>
        </div>

        {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}

        <div className="flex items-center gap-4 pt-2">
          <SubmitButton
            type="submit"
            text="Simpan"
            isLoading={isLoading}
            className="bg-black dark:bg-white text-white dark:text-gray-900 dark:hover:bg-gray-200 hover:bg-black/80 px-6 py-2 rounded text-sm"
          />
          <SubmitButton
            text="Batal"
            href="/admin/manajemen-akademik/semester"
            className="bg-white dark:bg-black text-text-gray-900 dark:white dark:hover:bg-black/10 hover:bg-gray-200 px-6 py-2 rounded text-sm border border-gray-300 dark:border-gray-800"
          />
        </div>
      </div>
    </form>
  );
}
