"use client";

import { useState, useEffect, ChangeEvent, FormEvent, useMemo } from "react";
import { SubmitButton } from "@/components/auth/SubmitButton";
import Image from "next/image";
import { useRef } from "react";

interface Option {
  id: string;
  name: string;
}

interface CreateMahasiswaFormProps {
  semesters: Option[];
  prodis: Option[];
  golongans: Option[];
}

export default function CreateMahasiswaPage({ semesters, prodis, golongans }: CreateMahasiswaFormProps) {
  const [form, setForm] = useState({
    name: "",
    nim: "",
    email: "",
    no_hp: "",
    alamat: "",
    semester: "",
    prodi: "",
    golongan: "",
    gender: "",
    foto: null as File | null,
  });

  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load preview dari localStorage saat mount
  useEffect(() => {
    const saved = localStorage.getItem("foto-preview");
    const expiry = localStorage.getItem("foto-preview-expiry");

    if (saved && expiry && Date.now() < Number(expiry)) {
      setPreview(saved);
    } else {
      localStorage.removeItem("foto-preview");
      localStorage.removeItem("foto-preview-expiry");
    }
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target;
    const { name, value } = target;

    if (target instanceof HTMLInputElement && target.type === "file") {
      const file = target.files?.[0];
      if (file) {
        setIsLoading(true);
        setForm((prev) => ({ ...prev, [name]: file }));

        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          setPreview(result);
          localStorage.setItem("foto-preview", result);
          localStorage.setItem("foto-preview-expiry", String(Date.now() + 1000 * 60 * 5)); // 5 menit
          setIsLoading(false);
        };
        reader.readAsDataURL(file);
      } else {
        setIsLoading(false);
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log(form);

    // Submit sukses → hapus preview dari localStorage
    localStorage.removeItem("foto-preview");
    localStorage.removeItem("foto-preview-expiry");
  };

  const imagePreview = useMemo(() => {
    if (!preview) return null;
    return (
      <Image
        key="preview"
        src={preview}
        alt="Preview Foto"
        width={200}
        height={244}
        className="object-cover w-full h-full"
      />
    );
  }, [preview]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    setIsLoading(true);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full mx-auto p-8 bg-white dark:bg-black/20 rounded shadow">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Tambah Mahasiswa</h1>

      <form onSubmit={handleSubmit} className="flex items-start gap-8 w-full">
        {/* Kiri: Form */}
        <div className="space-y-4 w-3/2">
          {/* Nama dan NIM */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Nama Lengkap"
              className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-black/50 dark:text-white border-gray-300 dark:border-gray-800 text-sm placeholder-gray-700/50 dark:placeholder-gray-400/50 focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
              required
            />
            <input
              name="nim"
              value={form.nim}
              onChange={handleChange}
              placeholder="NIM"
              className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-black/50 dark:text-white border-gray-300 dark:border-gray-800 text-sm placeholder-gray-700/50 dark:placeholder-gray-400/50 focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
              required
            />
          </div>

          {/* Email dan No HP */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-black/50 dark:text-white border-gray-300 dark:border-gray-800 text-sm placeholder-gray-700/50 dark:placeholder-gray-400/50 focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
              required
            />
            <input
              name="no_hp"
              value={form.no_hp}
              onChange={handleChange}
              placeholder="No HP"
              className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-black/50 dark:text-white border-gray-300 dark:border-gray-800 text-sm placeholder-gray-700/50 dark:placeholder-gray-400/50 focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
            />
          </div>

          {/* Alamat */}
          <textarea
            name="alamat"
            value={form.alamat}
            onChange={handleChange}
            placeholder="Alamat"
            className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-black/50 dark:text-white border-gray-300 dark:border-gray-800 text-sm placeholder-gray-700/50 dark:placeholder-gray-400/50 focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
            rows={2}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              name="semester"
              value={form.semester}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-black/50 dark:text-white border-gray-300 dark:border-gray-800 text-sm placeholder-gray-700/50 dark:placeholder-gray-400/50 focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
              required
            >
              <option value="" disabled className="bg-white dark:bg-black/95">
                Pilih Semester
              </option>
              {semesters.map((s) => (
                <option key={s.id} value={s.id} className="bg-white dark:bg-black/95">
                  {s.name}
                </option>
              ))}
            </select>
            <select
              name="prodi"
              value={form.prodi}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-black/50 dark:text-white border-gray-300 dark:border-gray-800 text-sm placeholder-gray-700/50 dark:placeholder-gray-400/50 focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
              required
            >
              <option value="" disabled className="bg-white dark:bg-black/95">
                Pilih Program Studi
              </option>
              {prodis.map((p) => (
                <option key={p.id} value={p.id} className="bg-white dark:bg-black/95">
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gender */}
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded bg-gray-50 dark:bg-black/50 dark:text-white border-gray-300 dark:border-gray-800 text-sm placeholder-gray-700/50 dark:placeholder-gray-400/50 focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
              required
            >
              <option value="" disabled className="bg-white dark:bg-black/95">
                Pilih Gender
              </option>
              <option value="LAKI-LAKI" className="bg-white dark:bg-black/95">
                Laki-laki
              </option>
              <option value="PEREMPUAN" className="bg-white dark:bg-black/95">
                Perempuan
              </option>
            </select>
            <select
              name="golongan"
              value={form.golongan}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-black/50 dark:text-white border-gray-300 dark:border-gray-800 text-sm placeholder-gray-700/50 dark:placeholder-gray-400/50 focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
              required
            >
              <option value="" disabled className="bg-white dark:bg-black/95">
                Pilih Golongan
              </option>
              {golongans.map((g) => (
                <option key={g.id} value={g.id} className="bg-white dark:bg-black/95">
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            {/* Submit */}
            <SubmitButton
              type="submit"
              text="Tambah Mahasiswa"
              className="bg-black dark:bg-white text-white dark:text-gray-900 dark:hover:bg-gray-200 hover:bg-black/80 px-6 py-2 rounded text-sm"
            />
            <SubmitButton
              text="Batal"
              href="/admin/manajemen-akademik/mahasiswa"
              className="bg-white dark:bg-black text-text-gray-900 dark:white dark:hover:bg-black/10 hover:bg-gray-200 px-6 py-2 rounded text-sm border border-gray-300 dark:border-gray-800"
            />
          </div>
        </div>

        {/* Kanan: Foto */}
        <div className="flex flex-col items-center gap-2 w-1/3">
          <div className="w-50 h-61 border border-dashed border-gray-400 dark:border-gray-600 rounded-md flex items-center justify-center overflow-hidden bg-transparent transition-opacity duration-300 will-change-opacity">
            {imagePreview ?? (
              <span className="text-sm text-gray-400 dark:text-gray-500 text-center">Belum ada foto</span>
            )}
          </div>

          {/* Tombol pakai SubmitButton, klik trigger input file */}
          <SubmitButton
            type="button"
            text={form.foto ? "Ganti Foto" : "Upload Foto"}
            isLoading={isLoading}
            className="w-50 text-center mt-2 px-4 py-2 text-sm rounded border bg-gray-100 dark:bg-black text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-800 hover:bg-gray-200 dark:hover:bg-black/20"
            onClick={handleUploadClick} // trigger input file
          />

          {/* Input file hidden */}
          <input
            ref={fileInputRef}
            id="foto"
            type="file"
            name="foto"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setIsLoading(true);
                const reader = new FileReader();
                reader.onloadend = () => {
                  const result = reader.result as string;
                  setForm((prev) => ({ ...prev, foto: file }));
                  setPreview(result);
                  localStorage.setItem("foto-preview", result);
                  localStorage.setItem("foto-preview-expiry", String(Date.now() + 1000 * 60 * 5));
                  setIsLoading(false);
                };
                reader.readAsDataURL(file);
              } else {
                setIsLoading(false);
              }
            }}
            className="hidden"
          />
        </div>
      </form>
    </div>
  );
}
