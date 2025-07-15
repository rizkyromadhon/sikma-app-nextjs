"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { Ruangan, AlatMode, AlatStatus } from "@/generated/prisma/client";
import { format, parseISO } from "date-fns";

type AlatPresensiData = {
  id: string;
  name: string;
  mode: AlatMode;
  status: AlatStatus;
  jadwal_nyala: string | null;
  jadwal_mati: string | null;
  ruanganId: string;
};

interface EditAlatFormProps {
  alat: AlatPresensiData;
  ruangans: Ruangan[];
}

export default function EditAlatForm({ alat, ruangans }: EditAlatFormProps) {
  const router = useRouter();

  const [form, setForm] = useState({
    name: alat.name,
    ruanganId: alat.ruanganId,
    jadwal_nyala: alat.jadwal_nyala ? format(parseISO(alat.jadwal_nyala), "HH:mm") : "",
    jadwal_mati: alat.jadwal_mati ? format(parseISO(alat.jadwal_mati), "HH:mm") : "",
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
      console.log(convertTimeToISO(form.jadwal_nyala), convertTimeToISO(form.jadwal_mati));
      const response = await fetch(`/api/alat-presensi/${alat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          jadwal_nyala: form.jadwal_nyala ? convertTimeToISO(form.jadwal_nyala) : null,
          jadwal_mati: form.jadwal_mati ? convertTimeToISO(form.jadwal_mati) : null,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal menyimpan perubahan.");

      router.push("/admin/manajemen-presensi/alat-presensi?alat_updated=success");
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
            className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-neutral-950/40 dark:text-white border-gray-300 dark:border-neutral-800 text-sm placeholder-gray-700/50 dark:placeholder-gray-400/50 focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
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
            className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-neutral-950/40 dark:text-white border-gray-300 dark:border-neutral-800 text-sm placeholder-gray-700/50 dark:placeholder-gray-400/50 focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
            required
          >
            <option value="" disabled className="bg-white dark:bg-neutral-900">
              Pilih Ruangan
            </option>
            {ruangans.map((r) => (
              <option key={r.id} value={r.id.toString()} className="bg-white dark:bg-neutral-900">
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
              className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-neutral-950/40 dark:text-white border-gray-300 dark:border-neutral-800 text-sm placeholder-gray-700/50 dark:placeholder-gray-400/50 focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
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
              className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-neutral-950/40 dark:text-white border-gray-300 dark:border-neutral-800 text-sm placeholder-gray-700/50 dark:placeholder-gray-400/50 focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

        <div className="flex items-center gap-4 pt-4">
          <SubmitButton
            type="submit"
            text="Simpan"
            isLoading={isLoading}
            className="bg-black dark:bg-white text-white dark:text-gray-900 hover:bg-slate-900 dark:hover:bg-gray-200 px-6 py-2 rounded-md text-sm"
          />
          <SubmitButton
            text="Batal"
            href="/admin/manajemen-presensi/alat-presensi"
            className="bg-white dark:bg-neutral-950/50 text-gray-900 dark:text-white dark:hover:bg-black/10 hover:bg-gray-200 px-6 py-2 rounded-md text-sm border border-gray-300 dark:border-neutral-800"
          />
        </div>
      </div>
    </form>
  );
}
