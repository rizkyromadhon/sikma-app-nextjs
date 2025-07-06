"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { useRouter } from "next/navigation";
import { Semester } from "@/generated/prisma/client";

interface CreatePesertaFormProps {
  prodiId: string;
  semesters: Semester[];
}

export default function CreatePesertaForm({ prodiId, semesters }: CreatePesertaFormProps) {
  const router = useRouter();
  const [semesterId, setSemesterId] = useState<string>("");
  const [golonganId, setGolonganId] = useState<string>("");
  const [mahasiswaId, setMahasiswaId] = useState<string>("");
  const [jadwalId, setJadwalId] = useState<string>("");

  const [golonganOptions, setGolonganOptions] = useState<{ id: string; name: string }[]>([]);
  const [mahasiswaOptions, setMahasiswaOptions] = useState<
    { id: string; name: string; nim: string | null }[]
  >([]);
  const [jadwalOptions, setJadwalOptions] = useState<{ id: string; name: string }[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!semesterId) {
      setGolonganOptions([]);
      setGolonganId("");
      setMahasiswaOptions([]);
      setMahasiswaId("");
      setJadwalOptions([]);
      setJadwalId("");
      return;
    }

    const fetchData = async () => {
      try {
        const [golonganRes, jadwalRes] = await Promise.all([
          fetch(`/api/golongan?semesterId=${semesterId}&prodiId=${prodiId}`),
          fetch(`/api/jadwal-kuliah?semesterId=${semesterId}&prodiId=${prodiId}`),
        ]);
        const [golonganData, jadwalData] = await Promise.all([golonganRes.json(), jadwalRes.json()]);
        setGolonganOptions(Array.isArray(golonganData) ? golonganData : []);
        setJadwalOptions(
          Array.isArray(jadwalData)
            ? jadwalData.map((j) => ({
                id: j.id,
                name: `${j.mata_kuliah?.name || "(No Matkul)"} - ${j.hari} - ${j.jam_mulai}-${j.jam_selesai}`,
              }))
            : []
        );
      } catch (err) {
        console.error(err);
        setGolonganOptions([]);
        setJadwalOptions([]);
      }
    };

    fetchData();
  }, [semesterId, prodiId]);

  useEffect(() => {
    if (!semesterId || !golonganId) {
      setMahasiswaOptions([]);
      setMahasiswaId("");
      return;
    }

    const fetchMahasiswa = async () => {
      try {
        const res = await fetch(
          `/api/mahasiswa?semesterId=${semesterId}&golonganId=${golonganId}&prodiId=${prodiId}`
        );
        const data = await res.json();
        setMahasiswaOptions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setMahasiswaOptions([]);
      }
    };

    fetchMahasiswa();
  }, [semesterId, golonganId, prodiId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!semesterId || !golonganId || !mahasiswaId || !jadwalId) {
      setError("Semua field harus diisi.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/peserta-kuliah", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mahasiswaId,
          jadwalKuliahId: jadwalId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        router.push(`?peserta-kuliah=${data.redirectParam || "error"}`);
        return;
      }

      router.push("/admin/manajemen-akademik/peserta-kuliah?peserta-kuliah=create_success");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Semester</label>
        <select
          value={semesterId}
          onChange={(e) => setSemesterId(e.target.value)}
          className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-neutral-950/40 dark:text-white border-gray-300 dark:border-neutral-800 text-sm placeholder-gray-700/50 dark:placeholder-gray-400/50 focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
          required
        >
          <option value="" className="bg-white dark:bg-neutral-900">
            Pilih Semester
          </option>
          {semesters.map((s) => (
            <option key={s.id} value={s.id} className="bg-white dark:bg-neutral-900">
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Golongan</label>
        <select
          value={golonganId}
          onChange={(e) => setGolonganId(e.target.value)}
          disabled={!semesterId || golonganOptions.length === 0}
          className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-neutral-950/50 dark:text-white border-gray-300 dark:border-neutral-800 text-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          required
        >
          {!semesterId ? (
            <option value="" className="bg-white dark:bg-neutral-900" disabled>
              Pilih Semester dulu
            </option>
          ) : golonganOptions.length === 0 ? (
            <option value="" className="bg-white dark:bg-neutral-900" disabled>
              Tidak ada golongan
            </option>
          ) : (
            <>
              <option value="" className="bg-white dark:bg-neutral-900">
                Pilih Golongan
              </option>
              {golonganOptions.map((g) => (
                <option key={g.id} value={g.id} className="bg-white dark:bg-neutral-900">
                  {g.name}
                </option>
              ))}
            </>
          )}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Mahasiswa</label>
        <select
          value={mahasiswaId}
          onChange={(e) => setMahasiswaId(e.target.value)}
          disabled={!semesterId || !golonganId || mahasiswaOptions.length === 0}
          className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-neutral-950/50 dark:text-white border-gray-300 dark:border-neutral-800 text-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          required
        >
          {!semesterId || !golonganId ? (
            <option value="" className="bg-white dark:bg-neutral-900" disabled>
              Pilih Semester & Golongan dulu
            </option>
          ) : mahasiswaOptions.length === 0 ? (
            <option value="" className="bg-white dark:bg-neutral-900" disabled>
              Tidak ada mahasiswa
            </option>
          ) : (
            <>
              <option value="" className="bg-white dark:bg-neutral-900">
                Pilih Mahasiswa
              </option>
              {mahasiswaOptions.map((m) => (
                <option key={m.id} value={m.id} className="bg-white dark:bg-neutral-900">
                  {m.name} ({m.nim || "-"})
                </option>
              ))}
            </>
          )}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Jadwal Kuliah</label>
        <select
          value={jadwalId}
          onChange={(e) => setJadwalId(e.target.value)}
          disabled={!semesterId || jadwalOptions.length === 0}
          className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-neutral-950/50 dark:text-white border-gray-300 dark:border-neutral-800 text-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          required
        >
          {!semesterId ? (
            <option value="" className="bg-white dark:bg-neutral-900" disabled>
              Pilih Semester dulu
            </option>
          ) : jadwalOptions.length === 0 ? (
            <option value="" className="bg-white dark:bg-neutral-900" disabled>
              Tidak ada jadwal kuliah
            </option>
          ) : (
            <>
              <option value="" className="bg-white dark:bg-neutral-900">
                Pilih Jadwal Kuliah
              </option>
              {jadwalOptions.map((j) => (
                <option key={j.id} value={j.id} className="bg-white dark:bg-neutral-900">
                  {j.name}
                </option>
              ))}
            </>
          )}
        </select>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex items-center gap-4 pt-4">
        <SubmitButton
          type="submit"
          text="Tambah Peserta"
          isLoading={isLoading}
          className="bg-black dark:bg-white text-white dark:text-gray-900 dark:hover:bg-gray-200 hover:bg-black/80 px-6 py-2 rounded-md text-sm"
        />
        <SubmitButton
          text="Batal"
          href="/admin/manajemen-akademik/peserta-kuliah"
          className="bg-white dark:bg-neutral-950/50 text-gray-900 dark:text-white dark:hover:bg-neutral-900 hover:bg-gray-200 px-6 py-2 rounded-md text-sm border border-gray-300 dark:border-neutral-800"
        />
      </div>
    </form>
  );
}
