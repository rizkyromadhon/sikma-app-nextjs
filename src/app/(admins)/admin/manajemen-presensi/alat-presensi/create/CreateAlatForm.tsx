"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { Ruangan } from "@/generated/prisma/client";

interface CreateAlatFormProps {
  ruangans: Ruangan[];
}

export default function CreateAlatForm({ ruangans }: CreateAlatFormProps) {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    jadwal_nyala: "", // Format "HH:mm"
    jadwal_mati: "", // Format "HH:mm"
    ruanganId: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validasi jam di frontend
    if (form.jadwal_nyala && form.jadwal_mati && form.jadwal_nyala >= form.jadwal_mati) {
      setError("Jadwal Nyala harus lebih awal dari Jadwal Mati.");
      setIsLoading(false);
      return;
    }

    try {
      function convertTimeToISO(time: string): string {
        const [hours, minutes] = time.split(":").map(Number);
        const date = new Date();

        date.setHours(hours);
        date.setMinutes(minutes);
        date.setSeconds(0);
        date.setMilliseconds(0);

        return date.toISOString();
      }
      const response = await fetch("/api/alat-presensi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          ruanganId: form.ruanganId,
          jadwal_nyala: form.jadwal_nyala ? convertTimeToISO(form.jadwal_nyala) : null,
          jadwal_mati: form.jadwal_mati ? convertTimeToISO(form.jadwal_mati) : null,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal menambahkan alat.");

      router.push("/admin/manajemen-presensi/alat-presensi?alat-presensi=create_success");
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
            Nama Alat Presensi
          </label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Contoh: Alat Presensi Lab Jaringan"
            className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-black/50 dark:text-white border-gray-300 dark:border-gray-800 text-sm focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
            required
          />
        </div>

        <div>
          <label
            htmlFor="ruanganId"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Lokasi Ruangan
          </label>
          <select
            id="ruanganId"
            name="ruanganId"
            value={form.ruanganId}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-black/50 dark:text-white border-gray-300 dark:border-gray-800 text-sm focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
            required
          >
            <option value="" disabled className="bg-white dark:bg-black/90">
              Pilih Ruangan
            </option>
            {ruangans.map((r) => (
              <option key={r.id} value={r.id.toString()} className="bg-white dark:bg-black/90">
                {r.kode} - {r.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="jadwal_nyala"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Jadwal Nyala (Opsional)
            </label>
            <input
              id="jadwal_nyala"
              name="jadwal_nyala"
              value={form.jadwal_nyala}
              onChange={handleChange}
              type="time"
              className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-black/50 dark:text-white border-gray-300 dark:border-gray-800 text-sm focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="jadwal_mati"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Jadwal Mati (Opsional)
            </label>
            <input
              id="jadwal_mati"
              name="jadwal_mati"
              value={form.jadwal_mati}
              onChange={handleChange}
              type="time"
              className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-black/50 dark:text-white border-gray-300 dark:border-gray-800 text-sm focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-500 dark:text-red-400 mt-2">{error}</p>}

        <div className="flex items-center gap-4 pt-4">
          <SubmitButton
            type="submit"
            text="Tambah"
            isLoading={isLoading}
            className="bg-black dark:bg-white text-white dark:text-gray-900 hover:bg-slate-900 dark:hover:bg-gray-200 px-6 py-2 rounded text-sm"
          />
          <SubmitButton
            text="Batal"
            href="/admin/manajemen-presensi/alat-presensi"
            className="bg-white dark:bg-black text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-black/10 px-6 py-2 rounded text-sm border border-gray-300 dark:border-gray-800"
          />
        </div>
      </div>
    </form>
  );
}
