"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import Link from "next/link";
import { Pencil, KeyRound, User2, Loader2 } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

type DosenProfile = {
  name: string;
  nip: string;
  email: string;
  foto: string;
  no_hp: string;
  alamat: string;
  prodi: string;
};

export default function ProfileDosenPage() {
  const [profile, setProfile] = useState<DosenProfile | null>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch("/api/dosen/profile");
      if (!res.ok) return console.error("Gagal mengambil data dosen");
      const data = await res.json();
      setProfile(data);
    };
    fetchProfile();
  }, []);

  async function handlePasswordChange(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log("Form submit terpanggil");
    setLoading(true);

    if (newPassword !== confirmPassword) {
      router.push("?dosen_profile=password_not_same");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      router.push("?dosen_profile=password_6_char");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/dosen/password", {
        method: "PUT",
        body: JSON.stringify({ oldPassword, newPassword }),
        headers: { "Content-Type": "application/json" },
      });

      console.log("Response status", res.status);
      const data = await res.json();
      console.log("Response data", data);

      if (!res.ok) {
        console.log("Server error detail:", data);

        if (data?.error === "Password lama salah") {
          router.push("?dosen_profile=old_password_wrong");
        } else {
          router.push("?dosen_profile=error");
        }

        setPasswordDialogOpen(true);
      } else {
        router.push("?dosen_profile=password_success");
        setPasswordDialogOpen(false);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      console.error("Fetch error", error);
      router.push("?dosen_profile=server_error");
    } finally {
      setLoading(false);
    }
  }

  if (!profile) {
    return (
      <main className="p-8">
        <div className="flex flex-col gap-4">
          <Skeleton className="w-32 h-32 rounded-full" />
          <Skeleton className="w-64 h-6" />
          <Skeleton className="w-40 h-4" />
          <Skeleton className="w-full h-10" />
          <Skeleton className="w-full h-10" />
        </div>
      </main>
    );
  }

  return (
    <main className="bg-muted/60 dark:bg-muted/40 border-b border-neutral-300 dark:border-neutral-800">
      <div className="p-6">
        <Breadcrumb className="ml-12">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dosen/dashboard">Dosen</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Profile</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="px-8 pb-8 flex items-center justify-between gap-8">
        <div className="flex flex-col items-center w-[50rem]">
          {profile?.foto ? (
            <Image
              src={profile?.foto}
              alt="Foto Profil"
              width={128}
              height={128}
              className="rounded-full object-cover mb-4 ring-4 ring-neutral-200 dark:ring-neutral-800"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-muted to-muted-foreground/30 flex items-center justify-center mb-4 ring-4 ring-background">
              <User2 className="w-16 h-16 text-muted-foreground" />
            </div>
          )}

          <h3 className="text-xl font-bold text-center">{profile?.name}</h3>
          <p className="text-sm text-muted-foreground">NIP: {profile?.nip || "-"}</p>

          <Separator className="my-6" />

          <div className="w-full space-y-3">
            <Button asChild className="w-full">
              <Link href="/dosen/profile/edit">
                <Pencil className="w-4 h-4 mr-2" /> Edit Profil
              </Link>
            </Button>
            <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button" // Pastikan ini type="button" agar tidak submit form lain
                  variant="secondary"
                  className="w-full border border-neutral-300 dark:border-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer"
                >
                  <KeyRound className="w-4 h-4 mr-2" /> Ubah Password
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Ubah Password</DialogTitle>
                </DialogHeader>

                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <Input
                    type="password"
                    placeholder="Password Lama"
                    name="old_password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                  />
                  <Input
                    type="password"
                    placeholder="Password baru"
                    name="new_password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <Input
                    type="password"
                    placeholder="Konfirmasi password baru"
                    name="confirm_password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />

                  <DialogFooter>
                    <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Menyimpan...
                        </>
                      ) : (
                        "Simpan Password"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <Card className="md:col-span-2 w-[50rem]">
          <CardHeader>
            <CardTitle>Info Kontak & Akademik</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Email</p>
              <p className="font-medium">{profile?.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">No. HP (WhatsApp)</p>
              <p className="font-medium">{profile?.no_hp || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Program Studi</p>
              <p className="font-medium">{profile?.prodi || "Tidak terhubung ke prodi"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Alamat</p>
              <p className="font-medium leading-relaxed whitespace-pre-line">{profile?.alamat || "-"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
