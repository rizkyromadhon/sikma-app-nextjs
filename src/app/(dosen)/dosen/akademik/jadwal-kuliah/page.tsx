"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

type Jadwal = {
  id: number;
  jam_mulai: string;
  jam_selesai: string;
  mata_kuliah: string;
  ruangan: string;
  semester: string;
  prodi: string;
  is_kelas_besar: boolean;
};

type JadwalPerHari = Record<string, Jadwal[]>;

export default function JadwalKuliahDosenPage() {
  const [jadwalPerHari, setJadwalPerHari] = useState<JadwalPerHari>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJadwal = async () => {
      try {
        const res = await fetch("/api/dosen/jadwal");
        if (!res.ok) throw new Error("Gagal memuat jadwal");

        const data = await res.json();
        console.log(data);
        setJadwalPerHari(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchJadwal();
  }, []);
  return (
    <main className="border-b border-neutral-300 dark:border-neutral-800">
      <div className="p-6">
        <div className="ml-12">
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
                <BreadcrumbPage>Jadwal Kuliah</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* MAIN CONTENT */}
        <div className="px-8 py-8 space-y-8">
          {loading ? (
            <div className="space-y-8">
              {[1, 2, 3].map((index) => (
                <Card key={index}>
                  <CardHeader className="border-b border-muted">
                    <Skeleton className="h-6 w-40" />
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-muted/40">
                        <div className="w-24 text-center flex-shrink-0 space-y-1">
                          <Skeleton className="h-4 w-16 mx-auto" />
                          <Skeleton className="h-2 w-8 mx-auto" />
                          <Skeleton className="h-4 w-16 mx-auto" />
                        </div>
                        <div className="border-l border-muted h-16"></div>
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-1/2" />
                          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-x-4 gap-y-1">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-3 w-32" />
                            <Skeleton className="h-3 w-28" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : Object.keys(jadwalPerHari).length === 0 ? (
            <div className="text-center py-12 px-6 bg-background rounded-xl shadow-sm border border-muted">
              <div className="w-16 h-16 bg-muted flex items-center justify-center mx-auto mb-4 rounded-full">
                <i className="fas fa-calendar-times text-3xl text-muted-foreground"></i>
              </div>
              <h3 className="text-lg font-semibold">Tidak Ada Jadwal Mengajar</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Anda belum memiliki jadwal mengajar untuk semester ini.
              </p>
            </div>
          ) : (
            Object.entries(jadwalPerHari).map(([hari, jadwals]) => (
              <Card key={hari}>
                <CardHeader className="border-b border-muted">
                  <CardTitle className="text-lg font-semibold">{hari}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {jadwals.map((jadwal) => (
                    <div
                      key={jadwal.id}
                      className="flex items-center gap-4 p-4 rounded-lg bg-muted/40 hover:bg-muted transition-colors duration-200"
                    >
                      {/* Waktu */}
                      <div className="w-24 text-center flex-shrink-0">
                        <p className="text-base font-bold text-primary">{jadwal.jam_mulai}</p>
                        <p className="text-xs text-muted-foreground">-</p>
                        <p className="text-sm font-semibold text-foreground">{jadwal.jam_selesai}</p>
                      </div>

                      <div className="border-l border-muted h-16"></div>

                      {/* Detail */}
                      <div className="flex-1">
                        <h4 className="text-md font-bold">{jadwal.mata_kuliah}</h4>
                        <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <i className="fas fa-map-marker-alt fa-fw"></i>
                            {jadwal.ruangan}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <i className="fas fa-university fa-fw"></i>
                            {jadwal.semester}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <i className="fas fa-layer-group fa-fw"></i>
                            {jadwal.prodi}
                            {jadwal.is_kelas_besar && (
                              <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full">
                                Kelas Besar
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
