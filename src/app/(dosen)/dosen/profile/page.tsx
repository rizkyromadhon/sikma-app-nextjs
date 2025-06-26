import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import Link from "next/link";
import { Pencil, KeyRound, User2 } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function ProfileDosenPage() {
  const data = {
    name: "Dr. Ahmad Santosa, M.Kom",
    nip: "197812312005121001",
    email: "ahmad.santosa@kampus.ac.id",
    no_hp: "081234567890",
    alamat: "Jl. Pendidikan No. 88, Bandung",
    prodi: "Teknik Informatika",
    foto: null, // atau gunakan URL: "/images/dosen.jpg"
  };

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
          {data.foto ? (
            <Image
              src={data.foto}
              alt="Foto Profil"
              width={128}
              height={128}
              className="rounded-full object-cover mb-4 ring-4 ring-background"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-muted to-muted-foreground/30 flex items-center justify-center mb-4 ring-4 ring-background">
              <User2 className="w-16 h-16 text-muted-foreground" />
            </div>
          )}

          <h3 className="text-xl font-bold text-center">{data.name}</h3>
          <p className="text-sm text-muted-foreground">NIP: {data.nip || "-"}</p>

          <Separator className="my-6" />

          <div className="w-full space-y-3">
            <Button asChild className="w-full">
              <Link href="/dosen/profile/edit">
                <Pencil className="w-4 h-4 mr-2" /> Edit Profil
              </Link>
            </Button>
            <Button
              asChild
              variant="secondary"
              className="w-full border border-neutral-300 dark:border-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            >
              <Link href="/dosen/password/edit">
                <KeyRound className="w-4 h-4 mr-2" /> Ubah Password
              </Link>
            </Button>
          </div>
        </div>
        <Card className="md:col-span-2 w-[50rem]">
          <CardHeader>
            <CardTitle>Info Kontak & Akademik</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Email</p>
              <p className="font-medium">{data.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">No. HP (WhatsApp)</p>
              <p className="font-medium">{data.no_hp || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Program Studi</p>
              <p className="font-medium">{data.prodi || "Tidak terhubung ke prodi"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Alamat</p>
              <p className="font-medium leading-relaxed whitespace-pre-line">{data.alamat || "-"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
