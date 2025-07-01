"use client";

import { useState, FormEvent, ChangeEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { Hari } from "@/generated/prisma/client";

interface FormOptions {
  id: string;
  name: string;
}
interface RuanganOption {
  id: string;
  kode: string;
  name: string;
}

type JadwalData = {
  id: string;
  hari: Hari;
  jam_mulai: string;
  jam_selesai: string;
  is_kelas_besar: boolean;
  matkulId: string;
  dosenId: string | null;
  semesterId: string;
  prodiId: string;
  ruanganId: string;
  golongans: { id: string }[];
  prodi: { id: string; name: string };
};

interface EditJadwalFormProps {
  prodiId: string;
  jadwal: JadwalData;
  semesters: FormOptions[];
  dosens: FormOptions[];
  mataKuliahs: FormOptions[];
  ruangans: RuanganOption[];
}

export default function EditJadwalForm({
  prodiId,
  jadwal,
  semesters,
  dosens,
  mataKuliahs,
  ruangans,
}: EditJadwalFormProps) {
  const router = useRouter();

  const [form, setForm] = useState({
    hari: jadwal.hari,
    jam_mulai: jadwal.jam_mulai,
    jam_selesai: jadwal.jam_selesai,
    matkulId: jadwal.matkulId,
    dosenId: jadwal.dosenId,
    semesterId: jadwal.semesterId.toString(),
    ruanganId: jadwal.ruanganId.toString(),
    golonganSelection: jadwal.is_kelas_besar ? "__KELAS_BESAR__" : jadwal.golongans?.[0]?.id || "",
  });

  const [filteredGolongans, setFilteredGolongans] = useState<FormOptions[]>([]);
  const [isLoadingGolongan, setIsLoadingGolongan] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!form.semesterId) return;
    const fetchGolongans = async () => {
      setIsLoadingGolongan(true);
      try {
        const res = await fetch(`/api/golongan?semesterId=${form.semesterId}&prodiId=${prodiId}`);
        if (!res.ok) throw new Error("Gagal mengambil data golongan");
        const data: FormOptions[] = await res.json();
        setFilteredGolongans(data);
      } catch (err) {
        console.error(err);
        setFilteredGolongans([]);
      } finally {
        setIsLoadingGolongan(false);
      }
    };
    fetchGolongans();
  }, [form.semesterId, prodiId]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "semesterId") {
      setForm((prev) => ({ ...prev, semesterId: value, golonganSelection: "" }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (form.jam_mulai >= form.jam_selesai) {
      setError("Jam mulai harus lebih awal daripada jam selesai.");
      setIsSubmitting(false);
      return;
    }
    if (!form.golonganSelection) {
      setError("Anda harus memilih Golongan atau Kelas Besar.");
      setIsSubmitting(false);
      return;
    }

    let golonganIdsToSend: string[] = [];
    const isKelasBesar = form.golonganSelection === "__KELAS_BESAR__";

    if (isKelasBesar) {
      golonganIdsToSend = filteredGolongans.map((g) => g.id);
    } else {
      golonganIdsToSend = [form.golonganSelection];
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
      const res = await fetch(`/api/jadwal-kuliah/${jadwal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hari: form.hari,
          jam_mulai: form.jam_mulai,
          jam_selesai: form.jam_selesai,
          matkulId: form.matkulId,
          dosenId: form.dosenId,
          semesterId: form.semesterId,
          ruanganId: form.ruanganId,
          prodiId,
          is_kelas_besar: isKelasBesar,
          golonganIds: golonganIdsToSend,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Gagal menyimpan perubahan.");
      router.push("/admin/manajemen-akademik/jadwal-kuliah?jadwal-kuliah=update_success");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Terjadi kesalahan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="space-y-4 w-full">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="hari" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Hari
            </label>
            <select
              name="hari"
              value={form.hari}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-neutral-950/40 dark:text-white border-gray-300 dark:border-neutral-800 text-sm placeholder-gray-700/50 dark:placeholder-gray-400/50 focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
              required
            >
              <option value="" className="bg-white dark:bg-neutral-900" disabled>
                Pilih Hari
              </option>
              {Object.values(Hari).map((hari) => (
                <option key={hari} value={hari} className="bg-white dark:bg-neutral-900">
                  {hari}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="matkulId"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Mata Kuliah
            </label>
            <select
              name="matkulId"
              value={form.matkulId}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-neutral-950/40 dark:text-white border-gray-300 dark:border-neutral-800 text-sm placeholder-gray-700/50 dark:placeholder-gray-400/50 focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
              required
            >
              <option value="" className="bg-white dark:bg-neutral-900" disabled>
                Pilih Mata Kuliah
              </option>
              {mataKuliahs.map((mk) => (
                <option key={mk.id} value={mk.id.toString()} className="bg-white dark:bg-neutral-900">
                  {mk.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="ruanganId"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Ruangan
            </label>
            <select
              name="ruanganId"
              value={form.ruanganId}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-neutral-950/40 dark:text-white border-gray-300 dark:border-neutral-800 text-sm placeholder-gray-700/50 dark:placeholder-gray-400/50 focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
              required
            >
              <option value="" className="bg-white dark:bg-neutral-900" disabled>
                Pilih Ruangan
              </option>
              {ruangans.map((r) => (
                <option key={r.id} value={r.id.toString()} className="bg-white dark:bg-neutral-900">
                  {r.kode} - {r.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="dosenId"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Dosen
            </label>
            <select
              name="dosenId"
              value={form.dosenId}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-neutral-950/40 dark:text-white border-gray-300 dark:border-neutral-800 text-sm placeholder-gray-700/50 dark:placeholder-gray-400/50 focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
              required
            >
              <option value="" className="bg-white dark:bg-neutral-900" disabled>
                Pilih Dosen
              </option>
              {dosens.map((dosen) => (
                <option key={dosen.id} value={dosen.id.toString()} className="bg-white dark:bg-neutral-900">
                  {dosen.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="semesterId"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Semester
            </label>
            <select
              name="semesterId"
              value={form.semesterId}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-neutral-950/40 dark:text-white border-gray-300 dark:border-neutral-800 text-sm placeholder-gray-700/50 dark:placeholder-gray-400/50 focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
              required
            >
              <option value="" className="bg-white dark:bg-neutral-900" disabled>
                Pilih Semester
              </option>
              {semesters.map((s) => (
                <option key={s.id} value={s.id.toString()} className="bg-white dark:bg-neutral-900">
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <input
            type="text"
            value={prodiId}
            disabled
            hidden
            className="w-full border p-2 rounded bg-gray-100 cursor-not-allowed"
          />
          <div>
            <label
              htmlFor="jam_mulai"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Jam mulai
            </label>
            <input
              type="time"
              name="jam_mulai"
              value={form.jam_mulai}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-neutral-950/40 dark:text-white border-gray-300 dark:border-neutral-800 text-sm placeholder-gray-700/50 dark:placeholder-gray-400/50 focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="golonganSelection" className="block text-sm font-medium mb-1">
              Golongan / Kelas
            </label>
            <select
              id="golonganSelection"
              name="golonganSelection"
              value={form.golonganSelection}
              onChange={handleChange}
              disabled={!form.semesterId || isLoadingGolongan || filteredGolongans.length === 0}
              className="w-full px-4 py-2 border rounded bg-gray-50 dark:bg-neutral-950/40 dark:text-white border-gray-300 dark:border-neutral-800 text-sm disabled:cursor-not-allowed disabled:opacity-50 placeholder-gray-700/50 dark:placeholder-neutral-400/50 focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
              required
            >
              {/* Opsi saat loading */}
              {isLoadingGolongan && (
                <option value="" disabled className="bg-white dark:bg-neutral-900">
                  Memuat golongan...
                </option>
              )}

              {/* Opsi saat belum pilih semester */}
              {!isLoadingGolongan && !form.semesterId && (
                <option value="" disabled className="bg-white dark:bg-neutral-900">
                  Pilih semester terlebih dahulu
                </option>
              )}

              {/* Opsi saat tidak ada golongan */}
              {!isLoadingGolongan && form.semesterId && filteredGolongans.length === 0 && (
                <option value="" disabled className="bg-white dark:bg-neutral-900">
                  Tidak ada golongan di semester ini
                </option>
              )}

              {/* Opsi default + data golongan */}
              {filteredGolongans.length > 0 && (
                <>
                  <option value="" disabled className="bg-white dark:bg-neutral-900">
                    Pilih Golongan
                  </option>
                  <option value="__KELAS_BESAR__" className="font-semibold bg-white dark:bg-neutral-900">
                    Kelas Besar (Gabungan Semua Golongan)
                  </option>
                  {filteredGolongans.map((g) => (
                    <option key={g.id} value={g.id} className="bg-white dark:bg-neutral-900">
                      {g.name}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          <div>
            <label
              htmlFor="jam_selesai"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Jam selesai
            </label>
            <input
              type="time"
              name="jam_selesai"
              value={form.jam_selesai}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-neutral-950/40 dark:text-white border-gray-300 dark:border-neutral-800 text-sm placeholder-gray-700/50 dark:placeholder-gray-400/50 focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex items-center gap-4 pt-4">
          <SubmitButton
            type="submit"
            text="Simpan"
            isLoading={isSubmitting}
            className="bg-black dark:bg-white text-white dark:text-gray-900 dark:hover:bg-gray-200 hover:bg-black/80 px-6 py-2 rounded-md text-sm"
          />
          <SubmitButton
            text="Batal"
            href="/admin/manajemen-akademik/jadwal-kuliah"
            className="bg-white dark:bg-neutral-950/50 text-gray-900 dark:text-white dark:hover:bg-black/10 hover:bg-gray-200 px-6 py-2 rounded-md text-sm border border-gray-300 dark:border-neutral-800"
          />
        </div>
      </div>
    </form>
  );
}
