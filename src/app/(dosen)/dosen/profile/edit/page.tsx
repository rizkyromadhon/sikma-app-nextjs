"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Textarea } from "@headlessui/react";
import { Loader2, Save } from "lucide-react";

type DosenProfile = {
  name: string;
  nip: string;
  email: string;
  foto: string;
  no_hp: string;
  alamat: string;
  prodi: string;
};

export default function EditProfileDosenPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<DosenProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch("/api/dosen/profile");
      if (!res.ok) return console.error("Gagal mengambil data dosen");
      const data = await res.json();
      setProfile(data);
    };
    fetchProfile();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("name", profile!.name);
    formData.append("nip", profile!.nip);
    formData.append("email", profile!.email);
    formData.append("no_hp", profile!.no_hp);
    formData.append("alamat", profile!.alamat);

    const fileInput = (e.target as HTMLFormElement).foto as HTMLInputElement;
    if (fileInput?.files?.[0]) {
      formData.append("foto", fileInput.files[0]);
    }

    const res = await fetch("/api/dosen/profile", {
      method: "PUT",
      body: formData,
    });

    setLoading(false);

    if (!res.ok) {
      toast("Gagal menyimpan data");
    } else {
      toast("Profil berhasil diperbarui!");
      router.push("/dosen/profile?dosen_profile=success");
    }
  };

  const handleCancel = () => {
    router.push("/dosen/profile");
  };

  if (!profile) {
    return (
      <main className="p-8">
        <Skeleton className="w-32 h-32 rounded-full mb-4" />
        <Skeleton className="w-full h-12" />
      </main>
    );
  }

  return (
    <main className="p-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Edit Profil Dosen</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col items-center gap-4">
              {preview || profile.foto ? (
                <Image
                  src={preview || profile.foto}
                  alt="Preview Foto"
                  width={128}
                  height={128}
                  className="rounded-full object-cover ring-4 ring-muted"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  Tidak ada foto
                </div>
              )}
              <div className="space-y-2">
                <input
                  id="foto"
                  type="file"
                  name="foto"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="foto"
                  className="inline-flex items-center justify-center w-32 py-2 px-4 rounded-md border border-neutral-300 dark:border-neutral-700 text-sm font-medium bg-secondary hover:bg-secondary/80 transition-colors cursor-pointer"
                >
                  {profile?.foto ? "Ganti Foto" : "Upload Foto"}
                </label>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="mb-2">
                  Nama
                </Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="nip" className="mb-2">
                  NIP
                </Label>
                <Input
                  id="nip"
                  value={profile.nip}
                  onChange={(e) => setProfile({ ...profile, nip: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email" className="mb-2">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="no_hp" className="mb-2">
                  No. HP (WhatsApp)
                </Label>
                <Input
                  id="no_hp"
                  value={profile.no_hp}
                  onChange={(e) => setProfile({ ...profile, no_hp: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="alamat" className="mb-2">
                Alamat
              </Label>
              <Textarea
                id="alamat"
                value={profile.alamat}
                onChange={(e) => setProfile({ ...profile, alamat: e.target.value })}
                className="px-4 py-2 text-sm text-neutral-700 dark:text-neutral-400 block bg-muted/40 border border-neutral-200 dark:border-neutral-700 w-full rounded-md focus:outline-none focus:shadow-[0_0_2px_2px] shadow-neutral-400/80 transition-all duration-200 ease-in-out"
              />
            </div>
            <div>
              <Label className="mb-2">Program Studi</Label>
              <Input
                type="text"
                value={profile.prodi}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="cursor-not-allowed select-none"
                disabled
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full cursor-pointer">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Simpan
                </>
              )}
            </Button>
            <Button
              type="button"
              onClick={handleCancel}
              className="w-full cursor-pointer bg-transparent dark:bg-neutral-800 border-2 dark:border-neutral-800 text-neutral-700 dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700 py-4 hover:transition-all"
            >
              Batal
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
