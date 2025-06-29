"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, Users, Clock, Megaphone, ClipboardList, BookOpen, Clock3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface DashboardData {
  kelasHariIniCount: number;
  totalMataKuliah: number;
  totalMahasiswaUnik: number;
  jamMengajarPerMinggu: number;
  dosenName: string;
}

interface DashboardSummaryProps {
  initialDosenName: string;
}

export default function DashboardSummary({ initialDosenName }: DashboardSummaryProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/dosen/dashboard");
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Gagal memuat data.");
        }
        const jsonData: DashboardData = await res.json();
        setData(jsonData);
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message || "Terjadi kesalahan saat memuat data dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="w-48 h-6" />
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Skeleton className="w-20 h-6" />
          </div>
        </div>
        <Skeleton className="w-full h-24 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
          <Skeleton className="w-full h-24 rounded-xl" />
          <Skeleton className="w-full h-24 rounded-xl" />
          <Skeleton className="w-full h-24 rounded-xl" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Skeleton className="w-full h-24 rounded-xl" />
            <Skeleton className="w-full h-24 rounded-xl" />
            <Skeleton className="w-full h-24 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        <h2 className="text-xl font-bold">Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  const { kelasHariIniCount, totalMataKuliah, totalMahasiswaUnik, jamMengajarPerMinggu } = data || {};

  return (
    <div className="px-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-between">
          <div>
            <Breadcrumb className="ml-6">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/dosen/dashboard">Dosen</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
        <div className="text-sm text-muted-foreground hidden md:flex items-center gap-2 mr-6">
          <Clock3 className="w-4 h-4" />
          <span>{currentTime}</span>
        </div>
      </div>

      <div className="rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-6 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-1">
            Selamat Datang Kembali, {data?.dosenName || initialDosenName}!
          </h2>
          <p className="text-sm text-blue-100">
            Anda memiliki <strong className="text-white">{kelasHariIniCount ?? "-"}</strong> kelas hari ini.
          </p>
        </div>
        <div className="absolute top-4 right-4 opacity-10 text-white">
          <ClipboardList className="w-20 h-20" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
        <Card className="bg-white dark:bg-neutral-800/50">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Mata Kuliah</p>
              <p className="text-2xl font-bold">{totalMataKuliah ?? "-"}</p>
            </div>
            <BookOpen className="w-10 h-10 text-blue-500" />
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-neutral-800/50">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Mahasiswa</p>
              <p className="text-2xl font-bold">{totalMahasiswaUnik ?? "-"}</p>
              <p className="text-xs text-blue-500 mt-1">Semester ini</p>
            </div>
            <Users className="w-10 h-10 text-green-500" />
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-neutral-800/50">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Jam Mengajar</p>
              <p className="text-2xl font-bold">{jamMengajarPerMinggu ?? "-"}</p>
              <p className="text-xs text-yellow-500 mt-1">Per minggu</p>
            </div>
            <Clock className="w-10 h-10 text-yellow-500" />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Megaphone className="text-yellow-500 w-5 h-5" /> Aksi Cepat
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            {
              icon: <CalendarDays className="w-6 h-6 text-blue-500" />,
              title: "Lihat Jadwal",
              color: "blue",
              href: "/dosen/akademik/jadwal-kuliah",
            },
            {
              icon: <Users className="w-6 h-6 text-green-500" />,
              title: "Kelola Presensi",
              color: "green",
              href: "/dosen/akademik/kelola-presensi",
            },
            {
              icon: <ClipboardList className="w-6 h-6 text-purple-500" />,
              title: "Pengajuan Izin/Sakit",
              color: "purple",
              href: "/dosen/akademik/pengajuan-izin",
            },
          ].map((action, i) => (
            <Link
              key={i}
              href={action.href}
              className={`rounded-xl border border-border bg-muted/40 p-4 flex flex-col items-center justify-center gap-3 hover:shadow-md hover:transition-all 
                ${action.color === "blue" ? "hover:border-blue-500" : ""} 
                ${action.color === "green" ? "hover:border-green-500" : ""}
                ${action.color === "purple" ? "hover:border-purple-500" : ""}`}
            >
              {action.icon}
              <span className="font-medium text-sm text-center text-foreground">{action.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
