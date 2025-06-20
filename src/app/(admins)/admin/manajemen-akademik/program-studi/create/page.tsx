"use client";

import { useState, FormEvent } from "react";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { useRouter } from "next/navigation";

export default function CreateProdiPage() {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/prodi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal menambahkan prodi.");
      router.push("/admin/manajemen-akademik/program-studi?program-studi=create_success");
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mt-10 mx-auto p-8 bg-white dark:bg-black/20 rounded-md shadow-[0_0_10px_1px_#1a1a1a1a] dark:shadow-[0_0_20px_1px_#ffffff1a]">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Tambah Program Studi</h1>
      <form onSubmit={handleSubmit} className="w-full">
        <div className="space-y-4 w-full">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nama Program Studi
            </label>
            <input
              id="name"
              name="name"
              value={name}
              autoComplete="off"
              onChange={(e) => setName(e.target.value)}
              placeholder="Teknik Komputer"
              className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-black/50 dark:text-white border-gray-300 dark:border-gray-800 text-sm focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
              required
            />
          </div>
          {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
          <div className="flex items-center gap-4 pt-2">
            <SubmitButton
              type="submit"
              text="Tambah Prodi"
              isLoading={isLoading}
              className="bg-black dark:bg-white text-white dark:text-gray-900 px-6 py-2 rounded text-sm"
            />
            <SubmitButton
              text="Batal"
              href="/admin/manajemen-akademik/program-studi"
              className="bg-white dark:bg-black text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-black/10 px-6 py-2 rounded text-sm border border-gray-300 dark:border-gray-800"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
