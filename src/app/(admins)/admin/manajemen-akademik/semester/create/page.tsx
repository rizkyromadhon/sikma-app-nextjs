"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { useRouter } from "next/navigation";

export default function CreateSemesterPage() {
  const [form, setForm] = useState({
    name: "",
    tipe: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [, setError] = useState<string | null>(null);
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
      const response = await fetch("/api/semester", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal menyimpan data.");
      }

      router.push("/admin/manajemen-akademik/semester?semester=create_success");
    } catch (err: unknown) {
      console.error(err);
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
    <div className="w-full max-w-2xl mt-10 mx-auto p-8 bg-white dark:bg-black/20 rounded-md shadow-[0_0_10px_1px_#1a1a1a1a] dark:shadow-[0_0_20px_1px_#ffffff1a]">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Tambah Semester</h1>

      <form onSubmit={handleSubmit} className="w-full">
        <div className="space-y-4 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Semester 1"
              className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-neutral-950/60 dark:text-white border-gray-300 dark:border-neutral-800 text-sm placeholder-gray-700/50 dark:placeholder-gray-400/50 focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
              required
            />
            <select
              name="tipe"
              value={form.tipe}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-neutral-950/40 dark:text-white border-gray-300 dark:border-neutral-800 text-sm placeholder-gray-700/50 dark:placeholder-gray-400/50 focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
              required
            >
              <option value="" disabled className="bg-white dark:bg-neutral-900">
                Pilih Tipe Semester
              </option>
              <option value="GANJIL" className="bg-white dark:bg-neutral-900">
                Ganjil
              </option>
              <option value="GENAP" className="bg-white dark:bg-neutral-900">
                Genap
              </option>
            </select>
          </div>

          <div className="flex items-center gap-4 pt-2">
            {/* Submit */}
            <SubmitButton
              type="submit"
              text="Tambah"
              isLoading={isLoading}
              className="bg-black dark:bg-white text-white dark:text-gray-900 dark:hover:bg-gray-200 hover:bg-black/80 px-6 py-2 rounded-md text-sm"
            />
            <SubmitButton
              text="Batal"
              href="/admin/manajemen-akademik/semester"
              className="bg-white dark:bg-neutral-950/50 text-gray-900 dark:text-white dark:hover:bg-black/10 hover:bg-gray-200 px-6 py-2 rounded-md text-sm border border-gray-300 dark:border-neutral-800"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
