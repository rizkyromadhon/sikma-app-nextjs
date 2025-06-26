"use client";

import { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@headlessui/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LaporanMahasiswaPage() {
  const [semester, setSemester] = useState("all");
  const [golongan, setGolongan] = useState("all");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [semesters, setSemesters] = useState<any[]>([]);
  const [golongans, setGolongans] = useState<any[]>([]);
  const [userProdiId, setUserProdiId] = useState<string | null>(null);
  const [laporan, setLaporan] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLaporan, setSelectedLaporan] = useState<any>(null);
  const [balasan, setBalasan] = useState("");
  const [actionType, setActionType] = useState<"Proses" | "Selesai" | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const laporanStatus = searchParams.get("laporan-mahasiswa");
    if (laporanStatus === "proses") {
      setStatus("Diproses");
    } else if (laporanStatus === "selesai") {
      setStatus("Selesai");
    } else {
      setStatus("all");
    }
  }, [searchParams]);

  const handleStatusChange = (value: string) => {
    setStatus(value);
    const urlParam = value === "Diproses" ? "proses" : value === "Selesai" ? "selesai" : "all";
    router.replace(`?laporan-mahasiswa=${urlParam}`);
  };

  const handleAction = (laporan: any, type: "Proses" | "Selesai") => {
    setSelectedLaporan(laporan);
    setActionType(type);
    setBalasan(type === "Proses" ? "Laporan Anda sedang diproses." : "Laporan Anda telah selesai ditangani.");
    setModalOpen(true);
  };

  const fetchLaporan = useCallback(async () => {
    setLoading(true);

    const params = new URLSearchParams();
    if (semester && semester !== "all") params.append("semester", semester);
    if (golongan && golongan !== "all") params.append("golongan", golongan);
    if (status && status !== "all") params.append("status", status);
    if (search) params.append("search", search);

    try {
      const res = await fetch(`/api/laporan/admin?${params.toString()}`);
      const data = await res.json();
      setLaporan(data);
    } catch (err) {
      console.error("Gagal mengambil data laporan", err);
    } finally {
      setLoading(false);
    }
  }, [semester, golongan, status, search]);

  const handleSubmitAction = async () => {
    if (!selectedLaporan) return;
    const newStatus = actionType === "Selesai" ? "Selesai" : "Diproses";

    await fetch(`/api/laporan/admin/update-status`, {
      method: "POST",
      body: JSON.stringify({
        id: selectedLaporan.id,
        status: actionType === "Selesai" ? "Selesai" : "Diproses",
        balasan,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    setModalOpen(false);
    setSelectedLaporan(null);
    setActionType(null);
    setBalasan("");
    const urlParam = newStatus === "Diproses" ? "proses" : "selesai";
    router.replace(`?laporan-mahasiswa=${urlParam}`);
    fetchLaporan();
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      const res = await fetch("/api/laporan/admin/init");
      const data = await res.json();
      setSemesters(data.semesters);
      setUserProdiId(data.prodiId);
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!semester || semester === "all" || !userProdiId) return setGolongans([]);

    const fetchGolongans = async () => {
      const res = await fetch(`/api/laporan/admin/golongans?semesterId=${semester}&prodiId=${userProdiId}`);
      const data = await res.json();
      setGolongans(data);
    };

    fetchGolongans();
  }, [semester, userProdiId]);

  useEffect(() => {
    fetchLaporan();
  }, [fetchLaporan]);

  return (
    <div className="p-6">
      <Breadcrumb className="ml-12 mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/admin/dashboard">Admin</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Laporan Mahasiswa</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Laporan Mahasiswa</h1>

      <div className="flex items-center gap-4 mb-6">
        <Select onValueChange={setSemester} defaultValue="all">
          <SelectTrigger className="w-50">
            <SelectValue placeholder="Semua Semester" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Semester</SelectItem>
            {semesters.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={setGolongan} disabled={!semester || semester === "all"} defaultValue="all">
          <SelectTrigger className="w-50">
            <SelectValue placeholder="Semua Golongan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Golongan</SelectItem>
            {golongans.map((g) => (
              <SelectItem key={g.id} value={g.id}>
                Golongan {g.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={setStatus} defaultValue="all">
          <SelectTrigger className="w-50">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="Belum Ditangani">Belum Ditangani</SelectItem>
            <SelectItem value="Diproses">Diproses</SelectItem>
            <SelectItem value="Selesai">Selesai</SelectItem>
          </SelectContent>
        </Select>

        <Input
          className="w-100"
          placeholder="Cari nama atau NIM..."
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {loading ? (
          <>
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </>
        ) : laporan.length === 0 ? (
          <p>Tidak ada laporan ditemukan.</p>
        ) : (
          laporan.map((item) => (
            <Card key={item.id}>
              <CardContent className="px-6 py-2 space-y-2">
                <div className="flex justify-between">
                  <div className="flex flex-col items-start gap-2">
                    <p className="font-semibold">
                      {item.user?.name} ({item.user?.nim})
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.user?.semester?.name} - Golongan {item.user?.golongan?.name}
                    </p>
                    <p className="text-sm text-muted-foreground">Tipe Laporan: {item.tipe}</p>
                    <p className="text-sm">Alasan: {item.pesan}</p>
                    {item.balasan && <p className="text-sm">Balasan: {item.balasan}</p>}
                  </div>
                  <div className="flex flex-col justify-between items-end">
                    <Badge
                      variant={item.status === "Selesai" ? "success" : "destructive"}
                      className={cn(
                        "capitalize",
                        item.status === "Selesai" ? "bg-emerald-500 text-white" : "bg-red-500"
                      )}
                    >
                      {item.status}
                    </Badge>
                    {item.status !== "Selesai" && (
                      <div className="flex items-end justify-end gap-2 mt-2">
                        {item.status !== "Diproses" && (
                          <Button
                            onClick={() => handleAction(item, "Proses")}
                            className="bg-amber-400 dark:bg-amber-700 hover:bg-yellow-500 dark:hover:bg-amber-800 text-amber-900 dark:text-white cursor-pointer"
                          >
                            Proses
                          </Button>
                        )}
                        {item.status === "Diproses" && (
                          <Button
                            onClick={() => handleAction(item, "Selesai")}
                            className="bg-emerald-600 dark:bg-emerald-800 hover:bg-green-700 dark:hover:bg-emerald-900 text-white cursor-pointer"
                          >
                            Selesaikan Laporan
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{actionType === "Proses" ? "Proses Laporan" : "Selesaikan Laporan"}</DialogTitle>
              <DialogDescription>Kirim Pesan Balasan ke Mahasiswa yang terkait</DialogDescription>
            </DialogHeader>
            <Textarea
              value={balasan}
              onChange={(e) => setBalasan(e.target.value)}
              className="px-4 py-2 text-sm text-neutral-700 dark:text-neutral-400 block bg-muted/40 border border-neutral-200 dark:border-neutral-700 w-full rounded-md focus:outline-none focus:shadow-[0_0_2px_2px] shadow-neutral-400/80 transition-all duration-200 ease-in-out"
            />
            <DialogFooter>
              <Button onClick={handleSubmitAction}>Kirim</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
