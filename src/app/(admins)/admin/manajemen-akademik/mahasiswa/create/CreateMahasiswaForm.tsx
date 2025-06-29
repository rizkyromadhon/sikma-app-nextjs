"use client";

import { useState, useEffect, ChangeEvent, FormEvent, useMemo } from "react";
import { SubmitButton } from "@/components/auth/SubmitButton";
import Image from "next/image";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";

interface GolonganOption {
  id: string;
  name: string;
  prodiId: string;
  semesterId: string;
}

interface Option {
  id: string;
  name: string;
}

interface CreateMahasiswaFormProps {
  semesters: Option[];
  prodis: Option[];
  golongans: GolonganOption[];
}

export default function CreateMahasiswaForm({ semesters, prodis, golongans }: CreateMahasiswaFormProps) {
  const router = useRouter();

  // State untuk form utama
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

  // State untuk preview foto dan loading
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // State untuk daftar golongan yang sudah difilter
  const [filteredGolongans, setFilteredGolongans] = useState<GolonganOption[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (form.prodi && form.semester) {
      const newFilteredGolongans = golongans.filter(
        (g) => g.prodiId === form.prodi && g.semesterId === form.semester
      );
      setFilteredGolongans(newFilteredGolongans);
    } else {
      setFilteredGolongans([]);
    }
  }, [form.prodi, golongans, form.semester]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (name === "prodi" || name === "semester") {
      setForm((prev) => ({ ...prev, [name]: value, golongan: "" }));
      return;
    }

    // Logika untuk upload file
    if (type === "file" && e.target instanceof HTMLInputElement) {
      const file = e.target.files?.[0];

      if (!file) {
        setIsUploading(false);
        return;
      }

      setForm((prev) => ({ ...prev, foto: file }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setIsUploading(false);
      };

      reader.readAsDataURL(file);
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      setIsUploading(true);

      const handleWindowFocus = () => {
        setTimeout(() => {
          const file = fileInputRef.current?.files?.[0];
          if (!file) {
            setIsUploading(false);
          }
          window.removeEventListener("focus", handleWindowFocus);
        }, 100);
      };

      window.addEventListener("focus", handleWindowFocus);

      fileInputRef.current.click();
    }
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
    console.log("data yang dikirim", formData);

    try {
      const response = await fetch("/api/mahasiswa", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Gagal menambahkan mahasiswa.");
      }

      router.push("/admin/manajemen-akademik/mahasiswa?mahasiswa=create_success");
      router.refresh();
      localStorage.removeItem("foto-preview");
      localStorage.removeItem("foto-preview-expiry");
    } catch (error) {
      if (error instanceof Error) {
        alert(`Error: ${error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full mx-auto px-8 py-6 bg-white dark:bg-neutral-900 rounded shadow-[0_0_10px_1px_#1a1a1a1a] dark:shadow-[0_0_20px_1px_#ffffff1a]">
      <Breadcrumb className="ml-10 mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/admin/dashboard">Admin</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbLink asChild>
            <Link href="#">Manajemen Akademik</Link>
          </BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbLink asChild>
            <Link href="/admin/manajemen-akademik/dosen">Mahasiswa</Link>
          </BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Tambah Mahasiswa</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

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
              className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-neutral-950/40 dark:text-white border-gray-300 dark:border-neutral-800 text-sm placeholder-gray-700/50 dark:placeholder-gray-400/50 focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
              required
            />
            <input
              name="nim"
              value={form.nim}
              onChange={handleChange}
              placeholder="NIM"
              className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-neutral-950/40 dark:text-white border-gray-300 dark:border-neutral-800 text-sm placeholder-gray-700/50 dark:placeholder-gray-400/50 focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
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
              className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-neutral-950/40 dark:text-white border-gray-300 dark:border-neutral-800 text-sm placeholder-gray-700/50 dark:placeholder-gray-400/50 focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
              required
            />
            <input
              name="no_hp"
              value={form.no_hp}
              onChange={handleChange}
              placeholder="No HP"
              className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-neutral-950/40 dark:text-white border-gray-300 dark:border-neutral-800 text-sm placeholder-gray-700/50 dark:placeholder-gray-400/50 focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
            />
          </div>

          {/* Alamat */}
          <textarea
            name="alamat"
            value={form.alamat}
            onChange={handleChange}
            placeholder="Alamat"
            className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-neutral-950/40 dark:text-white border-gray-300 dark:border-neutral-800 text-sm placeholder-gray-700/50 dark:placeholder-gray-400/50 focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
            rows={2}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              name="semester"
              value={form.semester}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-neutral-950/40 dark:text-white border-gray-300 dark:border-neutral-800 text-sm placeholder-gray-700/50 dark:placeholder-gray-400/50 focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
              required
            >
              <option value="" disabled className="bg-white dark:bg-neutral-900">
                Pilih Semester
              </option>
              {semesters.map((s) => (
                <option key={s.id} value={s.id} className="bg-white dark:bg-neutral-900">
                  {s.name}
                </option>
              ))}
            </select>
            <select
              name="prodi"
              value={form.prodi}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-neutral-950/40 dark:text-white border-gray-300 dark:border-neutral-800 text-sm placeholder-gray-700/50 dark:placeholder-gray-400/50 focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
              required
            >
              <option value="" disabled className="bg-white dark:bg-neutral-900">
                Pilih Program Studi
              </option>
              {prodis.map((p) => (
                <option key={p.id} value={p.id} className="bg-white dark:bg-neutral-900">
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
              className="w-full px-4 py-2 border rounded bg-gray-50 dark:bg-neutral-950/40 dark:text-white border-gray-300 dark:border-neutral-800 text-sm placeholder-gray-700/50 dark:placeholder-gray-400/50 focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none"
              required
            >
              <option value="" disabled className="bg-white dark:bg-neutral-900">
                Pilih Gender
              </option>
              <option value="LAKI-LAKI" className="bg-white dark:bg-neutral-900">
                Laki-laki
              </option>
              <option value="PEREMPUAN" className="bg-white dark:bg-neutral-900">
                Perempuan
              </option>
            </select>
            <select
              name="golongan"
              value={form.golongan}
              onChange={handleChange}
              disabled={!form.prodi || !form.semester}
              className="w-full px-4 py-2 border rounded bg-gray-50 dark:bg-neutral-950/40 dark:text-white border-gray-300 dark:border-neutral-800 text-sm placeholder-gray-700/50 dark:placeholder-gray-400/50 focus:shadow-[0_0_10px_1px_#1a1a1a1a] dark:focus:shadow-[0_0_10px_1px_#ffffff1a] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              <option value="" disabled className="bg-white dark:bg-neutral-900">
                {!form.semester
                  ? "Pilih Semester Dulu"
                  : !form.prodi
                  ? "Pilih Prodi Dulu"
                  : filteredGolongans.length === 0
                  ? "Tidak ada golongan"
                  : "Pilih Golongan"}
              </option>
              {filteredGolongans.map((g) => (
                <option key={g.id} value={g.id} className="bg-white dark:bg-neutral-900">
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4 mt-6">
            {/* Submit */}
            <SubmitButton
              type="submit"
              text="Tambah"
              isLoading={isSubmitting}
              className="bg-black dark:bg-white text-white dark:text-gray-900 dark:hover:bg-gray-200 hover:bg-black/80 px-6 py-2 rounded-md text-sm"
            />
            <SubmitButton
              text="Batal"
              href="/admin/manajemen-akademik/mahasiswa"
              className="bg-white dark:bg-neutral-950/50 text-text-gray-900 dark:white dark:hover:bg-black/10 hover:bg-gray-200 px-6 py-2 rounded-md text-sm border border-gray-300 dark:border-neutral-800"
            />
          </div>
        </div>

        {/* Kanan: Foto */}
        <div className="flex flex-col items-center gap-2 w-1/3">
          <div className="w-50 h-61 border border-dashed border-gray-400 dark:border-neutral-600 rounded-md flex items-center justify-center overflow-hidden bg-transparent transition-opacity duration-300 will-change-opacity">
            {imagePreview ?? (
              <span className="text-sm text-gray-400 dark:text-neutral-500 text-center">Belum ada foto</span>
            )}
          </div>

          <SubmitButton
            type="button"
            text={form.foto ? "Ganti Foto" : "Upload Foto"}
            isLoading={isUploading}
            className="w-50 text-center mt-2 px-4 py-2 text-sm rounded-md border bg-gray-100 dark:bg-neutral-950/50 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-neutral-800 hover:bg-gray-200 dark:hover:bg-black/20"
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
