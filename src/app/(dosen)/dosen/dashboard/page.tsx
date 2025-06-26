"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, Users, Clock, LineChart, Megaphone, ClipboardList, BookOpen } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";

export default function DosenDashboardPage() {
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Breadcrumb className="ml-12">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="#">Dosen</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="text-sm text-muted-foreground hidden md:flex items-center gap-2 mr-6">
          <CalendarDays className="w-4 h-4" />
          <span>{currentTime}</span>
        </div>
      </div>

      <div className="rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-6 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-1">Selamat Datang Kembali, Surateno, S.Kom.,M.Kom!</h2>
          <p className="text-sm text-blue-100">
            Anda memiliki <strong className="text-white">3</strong> kelas hari ini.
          </p>
        </div>
        <div className="absolute top-4 right-4 opacity-10 text-white">
          <ClipboardList className="w-20 h-20" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Mata Kuliah</p>
              <p className="text-2xl font-bold">6</p>
            </div>
            <BookOpen className="w-10 h-10 text-blue-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Mahasiswa</p>
              <p className="text-2xl font-bold">148</p>
              <p className="text-xs text-blue-500 mt-1">Semester ini</p>
            </div>
            <Users className="w-10 h-10 text-green-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Jam Mengajar</p>
              <p className="text-2xl font-bold">12</p>
              <p className="text-xs text-yellow-500 mt-1">Per minggu</p>
            </div>
            <Clock className="w-10 h-10 text-yellow-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Kehadiran</p>
              <p className="text-2xl font-bold">92%</p>
              <p className="text-xs text-green-500 mt-1">+5% dari bulan lalu</p>
            </div>
            <LineChart className="w-10 h-10 text-purple-500" />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Megaphone className="text-yellow-500 w-5 h-5" /> Aksi Cepat
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
            {
              icon: <Megaphone className="w-6 h-6 text-orange-500" />,
              title: "Pengumuman",
              color: "orange",
              href: "/dosen/pengumuman",
            },
          ].map((action, i) => (
            <Link
              key={i}
              href={action.href}
              className={`rounded-xl border border-border bg-muted/40 p-4 flex flex-col items-center justify-center gap-3 hover:shadow-md hover:transition-all 
                ${action.color === "blue" ? "hover:border-blue-500" : ""} 
                ${action.color === "green" ? "hover:border-green-500" : ""}
                ${action.color === "purple" ? "hover:border-purple-500" : ""}
                ${action.color === "orange" ? "hover:border-orange-500" : ""}`}
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
