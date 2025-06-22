"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { SubmitButton } from "@/components/auth/SubmitButton";

export default function CreateRuanganForm() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    type: "",
    lantai: "",
    ruang: "",
    kode: "JTI-00-00",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const prefix = "JTI";
    const lantaiFormatted = form.lantai.toString().padStart(2, "0");
    const ruangFormatted = form.ruang.toString().padStart(2, "0");

    const generatedKode = `${prefix}-${lantaiFormatted}-${ruangFormatted}`;

    setForm((prev) => ({ ...prev, kode: generatedKode }));
  }, [form.lantai, form.ruang]); // Array dependensi: efek ini berjalan jika form.lantai atau form.ruang berubah

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ruangan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kode: form.kode,
          name: form.name,
          type: form.type,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal menambahkan ruangan.");

      router.push("/admin/manajemen-akademik/ruangan?ruangan=create_success");
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
            Nama Ruangan
          </label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            autoComplete="off"
            placeholder="Contoh: Arsitektur Jaringan Komputer"
            className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-black/50 dark:text-white border-gray-300 dark:border-gray-800 text-sm focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
            required
          />
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tipe Ruangan
          </label>

          <select
            id="type"
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-black/50 dark:text-white border-gray-300 dark:border-gray-800 text-sm placeholder-gray-700/50 dark:placeholder-gray-400/50 focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
            required
          >
            <option value="" disabled className="bg-white dark:bg-black/95">
              Pilih Tipe
            </option>
            <option value="TEORI" className="bg-white dark:bg-black/95">
              TEORI
            </option>
            <option value="PRAKTIKUM" className="bg-white dark:bg-black/95">
              PRAKTIKUM
            </option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="lantai"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Lantai
            </label>
            <input
              id="lantai"
              name="lantai"
              value={form.lantai}
              onChange={handleChange}
              type="number"
              placeholder="Contoh: 2"
              autoComplete="new-password"
              className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-black/50 dark:text-white border-gray-300 dark:border-gray-800 text-sm focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
              required
            />
          </div>
          <div>
            <label
              htmlFor="ruang"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Nomor Ruang
            </label>
            <input
              id="ruang"
              name="ruang"
              value={form.ruang}
              onChange={handleChange}
              type="number"
              placeholder="Contoh: 1"
              className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-black/50 dark:text-white border-gray-300 dark:border-gray-800 text-sm focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="kode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Kode Ruangan (Otomatis)
          </label>
          <input
            id="kode"
            name="kode"
            value={form.kode}
            className="w-full px-4 py-2 border rounded-md bg-gray-200 dark:bg-black/10 dark:text-white border-gray-300 dark:border-gray-800 text-sm focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
            readOnly
          />
        </div>

        {error && <p className="text-sm text-red-500 dark:text-red-400 mt-2">{error}</p>}

        <div className="flex items-center gap-4 pt-4">
          <SubmitButton
            type="submit"
            text="Tambah Ruangan"
            isLoading={isLoading}
            className="bg-black dark:bg-white text-white dark:text-gray-900 dark:hover:bg-gray-200 hover:bg-black/80 px-6 py-2 rounded text-sm"
          />
          <SubmitButton
            text="Batal"
            href="/admin/manajemen-akademik/ruangan"
            className="bg-white dark:bg-black text-text-gray-900 dark:white dark:hover:bg-black/10 hover:bg-gray-200 px-6 py-2 rounded text-sm border border-gray-300 dark:border-gray-800"
          />
        </div>
      </div>
    </form>
  );
}
