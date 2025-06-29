"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import PengajuanCard from "./PengajuanCard";
import { FaRegEnvelope } from "react-icons/fa";

const pengajuanIzin = [
  {
    id: 1,
    user: { name: "Budi Santoso", nim: "1234567890", foto: "" },
    tipe_pengajuan: "Izin",
    pesan: "Saya tidak bisa hadir karena ada keperluan keluarga.",
    file_bukti: "",
    mata_kuliah: "Pemrograman Web",
    tanggal_izin: "Senin, 01 Juli 2025",
  },
  // Tambahkan data dummy lainnya...
];

interface Pengajuan {
  id: string;
  pesan: string;
  file_bukti: string | null;
  tanggal_izin: string; // di-serialize di API
  tipe_pengajuan: "IZIN" | "SAKIT";
  mahasiswa: {
    name: string;
    nim: string;
    foto: string | null;
  };
  jadwal_kuliah: {
    mata_kuliah: {
      name: string;
    };
  };
}

export default function PengajuanIzinDosenPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const statusPengajuan = searchParams.get("pengajuan-dosen");
  const [tab, setTab] = useState("DIPROSES");

  const [data, setData] = useState<Pengajuan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPengajuan = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/dosen/pengajuan-izin?status=${tab}`);
        const json = await res.json();
        setData(json.data);
      } catch (e) {
        console.error("Fetch pengajuan error", e);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPengajuan();
  }, [tab, statusPengajuan]);

  return (
    <div className="flex flex-col min-h-dvh bg-neutral-100 dark:bg-neutral-900">
      <div className="ml-18 pt-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dosen/dashboard">Dosen</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbLink asChild>
              <Link href="#">Akademik</Link>
            </BreadcrumbLink>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Pengajuan Izin/Sakit</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <main className="flex-grow p-4 sm:p-6 lg:p-8">
        <Tabs defaultValue={tab}>
          <TabsList className="mb-6 bg-neutral-200 dark:bg-neutral-800">
            <TabsTrigger value="DIPROSES" onClick={() => setTab("DIPROSES")} className="cursor-pointer">
              Baru
            </TabsTrigger>
            <TabsTrigger value="DISETUJUI" onClick={() => setTab("DISETUJUI")} className="cursor-pointer">
              Disetujui
            </TabsTrigger>
            <TabsTrigger value="DITOLAK" onClick={() => setTab("DITOLAK")} className="cursor-pointer">
              Ditolak
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-4">
          {loading ? (
            // skeleton loader
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-5 bg-neutral-200/40 dark:bg-neutral-800/50">
                <div className="flex items-start gap-4">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                </div>
              </Card>
            ))
          ) : data.length > 0 ? (
            data.map((pengajuan) => (
              <PengajuanCard
                key={pengajuan.id}
                pengajuan={pengajuan}
                currentStatus={tab}
                // onActionSuccess={() => setRefreshKey((k) => k + 1)}
              />
            ))
          ) : (
            <Card className="text-center py-16 px-6">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <FaRegEnvelope className="text-3xl text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">Tidak Ada Pengajuan</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Tidak ada pengajuan dengan status &quot;{tab}&quot; saat ini.
              </p>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
