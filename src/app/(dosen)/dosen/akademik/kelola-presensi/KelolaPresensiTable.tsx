"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { format, parseISO, parse } from "date-fns";
import { CalendarIcon, Loader2, Edit } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";

const getHoursMinutesFromUTCtoWIB = (isoString: string | null): string => {
  if (!isoString) return "-";
  try {
    const dateUTC = new Date(isoString);
    // Geser 7 jam ke WIB
    const hours = dateUTC.getHours().toString().padStart(2, "0");
    const minutes = dateUTC.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  } catch (e) {
    console.error("Error extracting WIB HH:mm from UTC string:", isoString, e);
    return "-";
  }
};
interface Mahasiswa {
  id: string;
  name: string;
  nim: string;
  golongan?: { name: string } | null;
}

interface MataKuliah {
  id: string;
  name: string;
}

interface JadwalKuliah {
  id: string;
  hari: string | null;
  jam_mulai: string;
  jam_selesai: string;
  ruangan?: { name: string } | null;
  mata_kuliah: MataKuliah;
}

interface PresensiKuliah {
  id: string;
  status: "HADIR" | "TIDAK_HADIR" | "IZIN" | "SAKIT";
  keterangan: string | null;
  waktu_presensi: string | null;
  mahasiswa: Mahasiswa;
  mata_kuliah: MataKuliah;
  jadwal_kuliah: JadwalKuliah;
}

interface FilterItem {
  id: string;
  name: string;
}

interface KelolaPresensiTableProps {
  presensiData: PresensiKuliah[];
  courses: FilterItem[];
  activeDate?: string;
  activeCourseId?: string;
}

export default function KelolaPresensiTable({
  presensiData,
  courses,
  activeDate,
  activeCourseId,
}: KelolaPresensiTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [date, setDate] = useState<Date | undefined>(activeDate ? parseISO(activeDate) : undefined);
  const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>(activeCourseId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPresensi, setSelectedPresensi] = useState<PresensiKuliah | null>(null);
  const [newStatus, setNewStatus] = useState<"HADIR" | "TIDAK_HADIR" | "IZIN" | "SAKIT" | "TERLAMBAT">(
    "HADIR"
  );
  const [isUpdating, setIsUpdating] = useState(false);

  const statusOptions = useMemo(
    () => [
      { value: "HADIR", label: "Hadir" },
      { value: "TIDAK_HADIR", label: "Tidak Hadir" },
      { value: "IZIN", label: "Izin" },
      { value: "SAKIT", label: "Sakit" },
      { value: "TERLAMBAT", label: "Terlambat" },
    ],
    []
  );

  const updateFilters = (dateVal?: Date, courseIdVal?: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (dateVal) {
      params.set("tanggal", format(dateVal, "yyyy-MM-dd"));
    } else {
      params.delete("tanggal");
    }

    if (courseIdVal && courseIdVal !== "all") {
      params.set("mataKuliahId", courseIdVal);
    } else {
      params.delete("mataKuliahId");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const groupedPresensi = useMemo(() => {
    const groups: Record<string, PresensiKuliah[]> = {};
    presensiData.forEach((p) => {
      const key = `${p.jadwal_kuliah.id}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(p);
    });
    return Object.values(groups);
  }, [presensiData]);

  const openStatusDialog = (presensi: PresensiKuliah) => {
    setSelectedPresensi(presensi);
    setNewStatus(presensi.status);
    setDialogOpen(true);
  };

  const handleChangeStatus = async () => {
    if (!selectedPresensi || !newStatus) return;

    setIsUpdating(true);
    try {
      const res = await fetch("/api/dosen/presensi", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          presensiId: selectedPresensi.id,
          newStatus: newStatus,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal memperbarui status");
      }

      router.push("?kelola-presensi=update_status_success");
      setDialogOpen(false);
      router.refresh();
    } catch (error: any) {
      console.error("Failed to update status:", error);
      router.push("?kelola-presensi=update_status_failed");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-8 py-6 min-h-[92dvh]">
      <div className="ml-10 mb-6">
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
              <BreadcrumbPage>Kelola Presensi</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
        Kelola Presensi
      </h1>

      <div className="flex flex-wrap gap-4 mb-8">
        {/* Filter Tanggal */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pilih Tanggal</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(selectedDate) => {
                setDate(selectedDate);
                updateFilters(selectedDate, selectedCourseId);
              }}
              autoFocus
            />
          </PopoverContent>
        </Popover>

        {/* Filter Mata Kuliah */}
        <Select
          onValueChange={(value) => {
            setSelectedCourseId(value);
            updateFilters(date, value);
          }}
          value={selectedCourseId || "all"}
        >
          <SelectTrigger className="w-[240px]">
            <SelectValue placeholder="Pilih Mata Kuliah" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Mata Kuliah</SelectItem>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(date || selectedCourseId) && (
          <Button
            variant="outline"
            onClick={() => {
              setDate(undefined);
              setSelectedCourseId(undefined);
              router.push(pathname);
            }}
          >
            Reset Filter
          </Button>
        )}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-muted shadow bg-neutral-100 dark:bg-neutral-800/30">
        {groupedPresensi.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Tidak ada data presensi yang ditemukan untuk filter ini.
          </div>
        ) : (
          groupedPresensi.map((schedulePresensiGroup) => (
            <div key={schedulePresensiGroup[0].jadwal_kuliah.id} className="mb-6">
              <div className="bg-white dark:bg-neutral-800 p-4 border-b border-neutral-300 dark:border-neutral-800">
                <h3 className="text-lg font-semibold text-foreground">
                  {schedulePresensiGroup[0].jadwal_kuliah.mata_kuliah.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Hari: {schedulePresensiGroup[0].jadwal_kuliah.hari} | Jam: {""}
                  {schedulePresensiGroup[0].jadwal_kuliah.jam_mulai} -{" "}
                  {schedulePresensiGroup[0].jadwal_kuliah.jam_selesai} | Ruangan:{" "}
                  {schedulePresensiGroup[0].jadwal_kuliah.ruangan?.name || "-"}
                </p>
              </div>
              <table className="min-w-full divide-y divide-muted">
                <thead className="bg-neutral-200 dark:bg-neutral-900/20">
                  <tr>
                    <th className="px-4 py-3 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Mahasiswa
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Keterangan
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted">
                  {schedulePresensiGroup.map((presensi) => (
                    <tr key={presensi.id} className="bg-neutral-100 dark:bg-neutral-900/50">
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <div className="text-sm font-medium text-foreground">{presensi.mahasiswa.name}</div>
                        <div className="text-xs text-muted-foreground">NIM: {presensi.mahasiswa.nim}</div>
                        {presensi.mahasiswa.golongan && (
                          <div className="text-xs text-muted-foreground">
                            Gol: {presensi.mahasiswa.golongan.name}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-sm">
                        <span
                          className={cn(
                            "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                            presensi.status === "HADIR"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : presensi.status === "IZIN"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              : presensi.status === "SAKIT"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          )}
                        >
                          {presensi.status.replace("_", " ")}
                        </span>
                        <div className="text-xs text-muted-foreground mt-1">
                          (
                          {presensi.waktu_presensi
                            ? getHoursMinutesFromUTCtoWIB(presensi.waktu_presensi)
                            : "-"}
                          )
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-muted-foreground">
                        {presensi.keterangan || "-"}
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-medium">
                        <Button variant="ghost" size="sm" onClick={() => openStatusDialog(presensi)}>
                          <Edit className="w-4 h-4 mr-1" /> Ubah
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>

      {/* Dialog Ubah Status Presensi */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ubah Status Presensi</DialogTitle>
          </DialogHeader>
          {selectedPresensi && (
            <div className="py-4 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Mahasiswa:</p>
                <p className="font-semibold text-base">
                  {selectedPresensi.mahasiswa.name} ({selectedPresensi.mahasiswa.nim})
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mata Kuliah:</p>
                <p className="font-semibold text-base">{selectedPresensi.jadwal_kuliah.mata_kuliah.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tanggal Presensi:</p>
                <p className="font-semibold text-base">
                  {selectedPresensi.waktu_presensi
                    ? format(parseISO(selectedPresensi.waktu_presensi), "PPP")
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Ubah Status Presensi:</p>
                <Select
                  value={newStatus}
                  onValueChange={(val: "HADIR" | "TIDAK_HADIR" | "IZIN" | "SAKIT" | "TERLAMBAT") =>
                    setNewStatus(val)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih status baru" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <Button onClick={handleChangeStatus} disabled={isUpdating}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
