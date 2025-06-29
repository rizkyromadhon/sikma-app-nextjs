"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ProgramStudi, Semester } from "@/generated/prisma/client";
import { SubmitButton } from "@/components/auth/SubmitButton";

interface CreateGolonganFormProps {
  prodiList: ProgramStudi[];
  semesterList: Semester[];
}

export default function CreateGolonganForm({ prodiList, semesterList }: CreateGolonganFormProps) {
  const [form, setForm] = useState({ name: "", prodiId: "", semesterId: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.prodiId) {
      setError("Program Studi harus dipilih.");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/golongan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, prodiId: form.prodiId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal menambahkan golongan.");
      router.push("/admin/manajemen-akademik/golongan?golongan=create_success");
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="space-y-4 w-full ">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nama Golongan
          </label>
          <input
            id="name"
            name="name"
            value={form.name}
            autoComplete="off"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Golongan A"
            className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-neutral-950/40 dark:text-white border-gray-300 dark:border-neutral-800 text-sm placeholder-gray-700/50 dark:placeholder-gray-400/50 focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
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
            className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-neutral-950/40 dark:text-white border-gray-300 dark:border-neutral-800 text-sm placeholder-gray-700/50 dark:placeholder-gray-400/50 focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
            required
          >
            <option value="" disabled className="bg-white dark:bg-neutral-900">
              Pilih Semester
            </option>
            {semesterList.map((smt) => (
              <option key={smt.id} value={smt.id} className="bg-white dark:bg-neutral-900">
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
            className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-neutral-950/40 dark:text-white border-gray-300 dark:border-neutral-800 text-sm placeholder-gray-700/50 dark:placeholder-gray-400/50 focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
            required
          >
            <option value="" disabled className="bg-white dark:bg-neutral-900">
              Pilih Program Studi
            </option>
            {prodiList.map((prodi) => (
              <option key={prodi.id} value={prodi.id} className="bg-white dark:bg-neutral-900">
                {prodi.name}
              </option>
            ))}
          </select>
        </div>


        {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}

        <div className="flex items-center gap-4 pt-2">
          <SubmitButton
            type="submit"
            text="Tambah"
            isLoading={isLoading}
            className="bg-black dark:bg-white text-white dark:text-gray-900 hover:bg-slate-900 dark:hover:bg-gray-200 px-6 py-2 rounded-md text-sm"
          />
          <SubmitButton
            text="Batal"
            href="/admin/manajemen-akademik/golongan"
            className="bg-white dark:bg-neutral-950/50 text-gray-900 dark:text-white dark:hover:bg-black/10 hover:bg-gray-200 px-6 py-2 rounded-md text-sm border border-gray-300 dark:border-neutral-800"
          />
        </div>
      </div>
    </form>
  );
}
