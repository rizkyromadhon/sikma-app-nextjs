"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { Ruangan } from "@/generated/prisma/client";

const parseKodeRuangan = (kode: string): { lantai: string; ruang: string } => {
  const parts = kode.split("-");
  if (parts.length === 3) {
    const lantai = parseInt(parts[1], 10).toString();
    const ruang = parseInt(parts[2], 10).toString();
    return { lantai, ruang };
  }
  return { lantai: "", ruang: "" };
};

export default function EditRuanganForm({ ruangan }: { ruangan: Ruangan }) {
  const router = useRouter();

  const [form, setForm] = useState(() => {
    const { lantai, ruang } = parseKodeRuangan(ruangan.kode);
    return {
      name: ruangan.name,
      type: ruangan.type,
      lantai: lantai,
      ruang: ruang,
      kode: ruangan.kode,
    };
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const prefix = "JTI";
    const lantaiFormatted = form.lantai.toString().padStart(2, "0");
    const ruangFormatted = form.ruang.toString().padStart(2, "0");
    const generatedKode = `${prefix}-${lantaiFormatted}-${ruangFormatted}`;
    setForm((prev) => ({ ...prev, kode: generatedKode }));
  }, [form.lantai, form.ruang]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/ruangan/${ruangan.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kode: form.kode,
          name: form.name,
          type: form.type,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal menyimpan perubahan.");

      router.push("/admin/manajemen-akademik/ruangan?ruangan=update_success");
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
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Nama Ruangan
          </label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            autoComplete="off"
            placeholder="Contoh: Laboratorium Jaringan Komputer"
            className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-neutral-950/40 dark:text-white border-gray-300 dark:border-neutral-800 text-sm placeholder-gray-700/50 dark:placeholder-gray-400/50 focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
            required
          />
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium mb-1">
            Tipe Ruangan
          </label>
          <select
            id="type"
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-neutral-950/40 dark:text-white border-gray-300 dark:border-neutral-800 text-sm placeholder-gray-700/50 dark:placeholder-gray-400/50 focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
            required
          >
            <option value="TEORI" className="bg-white dark:bg-neutral-900">
              TEORI
            </option>
            <option value="PRAKTIKUM" className="bg-white dark:bg-neutral-900">
              PRAKTIKUM
            </option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="lantai" className="block text-sm font-medium mb-1">
              Lantai
            </label>
            <input
              id="lantai"
              name="lantai"
              value={form.lantai}
              onChange={handleChange}
              type="number"
              placeholder="Contoh: 2"
              className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-neutral-950/40 dark:text-white border-gray-300 dark:border-neutral-800 text-sm placeholder-gray-700/50 dark:placeholder-gray-400/50 focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
              required
            />
          </div>
          <div>
            <label htmlFor="ruang" className="block text-sm font-medium mb-1">
              Nomor Ruang
            </label>
            <input
              id="ruang"
              name="ruang"
              value={form.ruang}
              onChange={handleChange}
              type="number"
              placeholder="Contoh: 1"
              className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-neutral-950/40 dark:text-white border-gray-300 dark:border-neutral-800 text-sm placeholder-gray-700/50 dark:placeholder-gray-400/50 focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="kode" className="block text-sm font-medium mb-1">
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
            href="/admin/manajemen-akademik/ruangan"
            className="bg-white dark:bg-neutral-950/50 text-text-gray-900 dark:white dark:hover:bg-black/10 hover:bg-gray-200 px-6 py-2 rounded-md text-sm border border-gray-300 dark:border-neutral-800"
          />
        </div>
      </div>
    </form>
  );
}
