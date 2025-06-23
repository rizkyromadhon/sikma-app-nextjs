"use client";

import { useState, ChangeEvent, FormEvent, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { SubmitButton } from "@/components/auth/SubmitButton";
import Image from "next/image";

interface Option {
  id: string;
  name: string;
}

interface DosenData {
  id: string;
  name: string;
  nip: string | null;
  email: string;
  no_hp: string | null;
  alamat: string | null;
  gender: string | null;
  foto: string | null;
  prodiId: string | null;
}

interface EditDosenFormProps {
  dosen: DosenData;
  prodis: Option[];
}

export default function EditMahasiswaForm({ dosen, prodis }: EditDosenFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: dosen.name || "",
    nip: dosen.nip || "",
    email: dosen.email || "",
    no_hp: dosen.no_hp || "",
    alamat: dosen.alamat || "",
    prodi: dosen.prodiId || "",
    gender: dosen.gender || "",
    foto: null as File | null,
  });

  const [preview, setPreview] = useState<string | null>(dosen.foto);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === "file" && e.target instanceof HTMLInputElement) {
      const file = e.target.files?.[0];
      if (file) {
        setIsUploading(true);
        setForm((prev) => ({ ...prev, foto: file }));

        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
          setIsUploading(false);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const imagePreview = useMemo(() => {
    if (!preview) return null;
    return (
      <Image
        key="preview"
        src={preview}
        alt="Preview Foto"
        width={200}
        height={200}
        className="object-cover"
      />
    );
  }, [preview]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });

    try {
      const response = await fetch(`/api/dosen/${dosen.id}`, {
        method: "PUT",
        body: formData,
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Gagal menyimpan perubahan.");
      }
      router.push("/admin/manajemen-akademik/dosen?dosen=update_success");
      router.refresh();
    } catch (error) {
      if (error instanceof Error) alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full mx-auto p-8 bg-white dark:bg-black/20 rounded shadow-[0_0_10px_1px_#1a1a1a1a] dark:shadow-[0_0_20px_1px_#ffffff1a]">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Edit Dosen - <strong>{dosen.name}</strong>
      </h1>
      <form onSubmit={handleSubmit} className="flex items-start gap-8 w-full">
        <div className="space-y-4 w-3/2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Nama Lengkap"
              autoComplete="off"
              className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-black/50 dark:text-white border-gray-300 dark:border-gray-800 text-sm placeholder-gray-700/50 dark:placeholder-gray-400/50 focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
              required
            />
            <input
              name="nip"
              value={form.nip}
              onChange={handleChange}
              placeholder="NIP"
              autoComplete="off"
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
              autoComplete="off"
              className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-black/50 dark:text-white border-gray-300 dark:border-gray-800 text-sm placeholder-gray-700/50 dark:placeholder-gray-400/50 focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
              required
            />
            <input
              name="no_hp"
              value={form.no_hp}
              onChange={handleChange}
              placeholder="No HP"
              autoComplete="new-password"
              className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-black/50 dark:text-white border-gray-300 dark:border-gray-800 text-sm placeholder-gray-700/50 dark:placeholder-gray-400/50 focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
            />
          </div>

          {/* Alamat */}
          <textarea
            name="alamat"
            value={form.alamat}
            onChange={handleChange}
            placeholder="Alamat"
            autoComplete="new-password"
            className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-black/50 dark:text-white border-gray-300 dark:border-gray-800 text-sm placeholder-gray-700/50 dark:placeholder-gray-400/50 focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
            rows={2}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          <div className="flex items-center gap-4">
            {/* Submit */}
            <SubmitButton
              type="submit"
              text="Simpan"
              isLoading={isSubmitting}
              className="bg-black dark:bg-white text-white dark:text-gray-900 dark:hover:bg-gray-200 hover:bg-black/80 px-6 py-2 rounded text-sm"
            />
            <SubmitButton
              text="Batal"
              href="/admin/manajemen-akademik/dosen"
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

          <SubmitButton
            type="button"
            text={form.foto ? "Ganti Foto" : "Upload Foto"}
            isLoading={isUploading}
            className="w-50 text-center mt-2 px-4 py-2 text-sm rounded border bg-gray-100 dark:bg-black text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-800 hover:bg-gray-200 dark:hover:bg-black/20"
            onClick={handleUploadClick}
          />

          <input
            ref={fileInputRef}
            id="foto"
            type="file"
            name="foto"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
          />
        </div>
      </form>
    </div>
  );
}
