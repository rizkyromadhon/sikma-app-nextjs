"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@headlessui/react";
import { Loader2, LucideEdit3 } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LuCircleUser } from "react-icons/lu";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [student, setStudent] = useState<{
    name: string;
    nim: string;
    email: string;
    semester: string;
    prodi: string;
    golongan: string;
    gender: string;
    no_hp: string;
    alamat: string;
    foto: string | null;
  } | null>(null);

  const [form, setForm] = useState({
    no_hp: "",
    alamat: "",
    foto: null as File | null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/mahasiswa/profile");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal mengambil data");

        setStudent(data);
        setForm({
          no_hp: data.no_hp ?? "",
          alamat: data.alamat ?? "",
          foto: null,
        });
        setPreview(data.foto ?? null);
      } catch (err) {
        console.error("Gagal ambil data profil:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("no_hp", form.no_hp);
      formData.append("alamat", form.alamat);
      if (form.foto) {
        formData.append("foto", form.foto);
      }

      const res = await fetch("/api/mahasiswa/profile", {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) throw new Error("Gagal menyimpan perubahan");

      const updated = await res.json();
      setStudent(updated);
      setOpen(false);
      router.replace("/profile?profile=edit_success");
    } catch (error) {
      console.error("Gagal update profil:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-[92dvh] px-4 py-8 sm:px-6 lg:px-8 bg-background text-foreground">
      <div className="max-w-5xl mx-auto rounded-2xl border border-border bg-muted/40 p-6 lg:p-10 shadow-sm">
        <div className="flex flex-col-reverse lg:flex-row justify-between gap-8">
          {/* Info */}
          <div className="flex-1 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Nama Lengkap</p>
                {loading ? (
                  <Skeleton className="h-6 w-1/2 mt-1" />
                ) : (
                  <p className="text-lg font-semibold">{student?.name}</p>
                )}
              </div>

              {!loading && (
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="gap-1">
                      <LucideEdit3 className="w-4 h-4" /> Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Profil</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div className="flex flex-col gap-4 items-center justify-center">
                        <div className="w-28 h-28 relative rounded-full overflow-hidden border border-border bg-muted flex items-center justify-center">
                          {preview ? (
                            <Image src={preview} alt="Preview Foto" fill className="object-cover" />
                          ) : (
                            <LuCircleUser className="w-16 h-16 text-muted-foreground" />
                          )}
                        </div>

                        <label
                          htmlFor="foto-upload"
                          className="cursor-pointer text-sm font-medium text-primary px-4 py-2 rounded-md bg-muted/40 border border-neutral-300 dark:border-neutral-800"
                        >
                          {preview ? "Ganti Foto" : "Upload Foto"}
                        </label>

                        <Input
                          id="foto-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setForm((f) => ({ ...f, foto: file }));
                              setPreview(URL.createObjectURL(file));
                            }
                          }}
                        />
                      </div>

                      <div>
                        <label htmlFor="no_hp" className="text-sm text-neutral-700 dark:text-neutral-400">
                          No HP
                        </label>
                        <Input
                          id="no_hp"
                          value={form.no_hp}
                          onChange={(e) => setForm((f) => ({ ...f, no_hp: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label htmlFor="alamat" className="text-sm text-neutral-700 dark:text-neutral-400">
                          Alamat
                        </label>
                        <Textarea
                          id="alamat"
                          className="px-4 py-2 text-sm text-neutral-700 dark:text-neutral-400 block bg-muted/40 border border-neutral-200 dark:border-neutral-700 w-full rounded-md focus:outline-none focus:shadow-[0_0_2px_2px] shadow-neutral-400/80 transition-all duration-200 ease-in-out"
                          value={form.alamat}
                          onChange={(e) => setForm((f) => ({ ...f, alamat: e.target.value }))}
                        />
                      </div>
                    </div>

                    <DialogFooter className="mt-4">
                      <Button
                        className="cursor-pointer relative min-w-[160px]"
                        onClick={handleSave}
                        disabled={isSaving}
                      >
                        {isSaving && (
                          <Loader2 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin w-4 h-4" />
                        )}
                        <span className={isSaving ? "invisible" : "visible"}>Simpan Perubahan</span>
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            <hr className="my-4 border-border" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
              {[
                { label: "NIM", value: student?.nim },
                { label: "Email", value: student?.email },
                { label: "Program Studi", value: student?.prodi },
                { label: "Semester", value: student?.semester },
                { label: "Golongan", value: student?.golongan },
                { label: "Jenis Kelamin", value: student?.gender },
                { label: "No HP", value: student?.no_hp },
                { label: "Alamat", value: student?.alamat },
              ].map((field, i) => (
                <div key={i}>
                  <p className="text-sm text-muted-foreground">{field.label}</p>
                  {loading ? (
                    <Skeleton className="h-5 w-3/4 mt-1" />
                  ) : (
                    <p className="font-semibold">{field.value}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Foto */}
          <div className="flex justify-center lg:justify-end items-start order-1 lg:order-none">
            <div className="relative w-44 h-44 rounded-2xl overflow-hidden border border-border bg-muted flex items-center justify-center">
              {loading ? (
                <Skeleton className="w-full h-full" />
              ) : student?.foto ? (
                <Image src={student.foto} alt={`Foto ${student.name}`} fill className="object-cover" />
              ) : (
                <LuCircleUser className="w-20 h-20 text-muted-foreground" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
