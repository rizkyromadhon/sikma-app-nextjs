"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { LuCircleArrowLeft, LuCircleArrowRight, LuDownload } from "react-icons/lu";
import { FaRegFileExcel, FaRegFilePdf } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Mahasiswa {
  id: string;
  nim: string | null;
  name: string | null;
  foto: string | null;
  semester: { name: string } | null;
  prodi: { name: string } | null;
  golongan: { name: string } | null;
}

interface FilterOption {
  id: string;
  name: string;
  semesterId?: string;
}

interface Filters {
  semesters: FilterOption[];
  golongans: FilterOption[];
  mataKuliahs: FilterOption[];
  current: {
    semester?: string;
    golongan?: string;
    search?: string;
  };
  prodiId: string;
}

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    semesters: FilterOption[];
    golongans: FilterOption[];
    mataKuliahs: FilterOption[];
    prodiId: string;
  };
}

function ExportModal({ isOpen, onClose, filters }: ExportModalProps) {
  const [selectedFilters, setSelectedFilters] = useState({
    semesterId: "",
    golonganId: "",
    matkulId: "",
  });
  const [filteredGolongans, setFilteredGolongans] = useState<FilterOption[]>([]);
  const [filteredMatkuls, setFilteredMatkuls] = useState<FilterOption[]>([]);
  const [loadingMatkul, setLoadingMatkul] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<"pdf" | "excel" | null>(null);
  const [isLoadingFormat, setIsLoadingFormat] = useState<"pdf" | "excel" | null>(null);

  useEffect(() => {
    if (!selectedFilters.semesterId) return;

    const golonganOptions = filters.golongans.filter((g) => g.semesterId === selectedFilters.semesterId);

    setFilteredGolongans(golonganOptions);
    setSelectedFilters((prev) => ({
      ...prev,
      golonganId: "",
      matkulId: "",
    }));
    setFilteredMatkuls([]);
  }, [selectedFilters.semesterId, filters.golongans]);

  useEffect(() => {
    if (!selectedFilters.semesterId || !selectedFilters.golonganId) return;

    const fetchMatkuls = async () => {
      setLoadingMatkul(true);
      try {
        const res = await axios.get(
          `/api/rekap/get-matkul-options?semesterId=${selectedFilters.semesterId}&golonganId=${selectedFilters.golonganId}`
        );
        setFilteredMatkuls(res.data);
      } catch (err) {
        console.error("Gagal mengambil matkul:", err);
      } finally {
        setLoadingMatkul(false);
      }
    };

    fetchMatkuls();
  }, [selectedFilters.semesterId, selectedFilters.golonganId]);

  const handleExport = async (format: "pdf" | "excel") => {
    if (!selectedFilters.semesterId || !selectedFilters.matkulId) {
      alert("Semester, Golongan, Mata Kuliah wajib dipilih.");
      return;
    }
    setExportingFormat(format);
    setIsLoadingFormat(format);
    try {
      const res = await axios.post(`/api/rekap/file/${format}`, selectedFilters, { responseType: "blob" });
      const blob = new Blob([res.data], {
        type: res.headers["content-type"],
      });

      if (format === "pdf") {
        const pdfUrl = URL.createObjectURL(blob);
        window.open(pdfUrl, "_blank");
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `rekap_kehadiran_${Date.now()}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      }

      onClose?.();
    } catch (err) {
      console.error(err);
      alert("Gagal mengekspor data.");
    } finally {
      setExportingFormat(null);
      setIsLoadingFormat(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ekspor Rekap Presensi</DialogTitle>
        </DialogHeader>

        {loadingMatkul ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="space-y-4">
            <Select
              value={selectedFilters.semesterId}
              onValueChange={(val) => setSelectedFilters((f) => ({ ...f, semesterId: val }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih Semester" />
              </SelectTrigger>
              <SelectContent>
                {filters.semesters.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedFilters.golonganId}
              onValueChange={(val) => setSelectedFilters((f) => ({ ...f, golonganId: val }))}
              disabled={!selectedFilters.semesterId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih Golongan" />
              </SelectTrigger>
              <SelectContent>
                {filteredGolongans.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedFilters.matkulId}
              onValueChange={(val) => setSelectedFilters((f) => ({ ...f, matkulId: val }))}
              disabled={!selectedFilters.semesterId || !selectedFilters.golonganId || loadingMatkul}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih Mata Kuliah" />
              </SelectTrigger>
              <SelectContent>
                {filteredMatkuls.length > 0 ? (
                  filteredMatkuls.map((mk) => (
                    <SelectItem key={mk.id} value={mk.id}>
                      {mk.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-4 py-2 text-sm text-muted-foreground">Tidak ada mata kuliah</div>
                )}
              </SelectContent>
            </Select>

            <div className="grid grid-cols-1 gap-2 pt-2">
              <Button
                onClick={() => handleExport("excel")}
                disabled={!!exportingFormat}
                className="relative bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-[0_0_12px_1px] shadow-emerald-600 dark:shadow-emerald-800 hover:transition-all cursor-pointer"
              >
                {isLoadingFormat === "excel" ? (
                  <Loader2 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin h-4 w-4" />
                ) : (
                  <div className="flex items-center justify-center w-full">
                    <FaRegFileExcel className="mr-2" /> Ekspor ke Excel
                  </div>
                )}
              </Button>

              <Button
                onClick={() => handleExport("pdf")}
                disabled={!!exportingFormat}
                className="relative bg-red-700 text-white hover:bg-red-700 hover:shadow-[0_0_12px_1px] shadow-red-600 dark:shadow-red-800 hover:transition-all cursor-pointer"
              >
                {isLoadingFormat === "pdf" ? (
                  <Loader2 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin h-4 w-4" />
                ) : (
                  <div className="flex items-center justify-center w-full">
                    <FaRegFilePdf className="mr-2" /> Ekspor ke PDF
                  </div>
                )}
              </Button>

              <Button variant="outline" onClick={onClose}>
                Batal
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function LihatDetailButton({ mahasiswaId }: { mahasiswaId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    setIsLoading(true);
    router.push(`/admin/manajemen-presensi/rekapitulasi-kehadiran/${mahasiswaId}`);
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      className="relative w-26 text-white dark:text-black bg-neutral-900 dark:bg-neutral-200 hover:opacity-80 cursor-pointer px-4 py-2"
    >
      {isLoading && (
        <Loader2 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin h-4 w-4" />
      )}
      <span className={`${isLoading ? "invisible" : "visible"}`}>Lihat Detail</span>
    </Button>
  );
}

export default function RekapTable({
  data,
  filters,
  totalPages,
  currentPage,
}: {
  data: Mahasiswa[];
  filters: Filters;
  totalPages: number;
  currentPage: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [filteredGolongans, setFilteredGolongans] = useState<FilterOption[]>([]);
  const [searchTerm, setSearchTerm] = useState(filters.current.search || "");
  const [semesterValue, setSemesterValue] = useState(searchParams.get("semester") ?? "all");
  const [golonganValue, setGolonganValue] = useState("");

  useEffect(() => {
    const semester = searchParams.get("semester") ?? "all";
    const golongan = searchParams.get("golongan") || "";
    setSemesterValue(semester);
    setGolonganValue(golongan);
  }, [searchParams]);

  useEffect(() => {
    if (semesterValue && semesterValue !== "all") {
      setFilteredGolongans(filters.golongans.filter((g) => g.semesterId === semesterValue));
    } else {
      setFilteredGolongans([]);
    }
  }, [semesterValue, filters.golongans]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (key !== "page") {
      params.set("page", "1");
    }
    if (key === "semester") {
      params.delete("golongan");
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Select value={semesterValue} onValueChange={(val) => updateFilter("semester", val)}>
            <SelectTrigger className="w-60">
              <SelectValue placeholder="Semua Semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Semester</SelectItem>
              {filters.semesters.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={golonganValue}
            onValueChange={(val) => updateFilter("golongan", val)}
            disabled={!semesterValue || semesterValue === "all"}
          >
            <SelectTrigger className="w-60">
              <SelectValue placeholder="Pilih Golongan" />
            </SelectTrigger>
            <SelectContent>
              {filteredGolongans.map((g) => (
                <SelectItem key={g.id} value={String(g.id)}>
                  {g.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Cari nama atau NIM..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              updateFilter("search", e.target.value);
            }}
            className="w-60"
          />
        </div>
        <div>
          <Button onClick={() => setIsExportModalOpen(true)} variant="outline" className="cursor-pointer">
            <LuDownload className="mr-2" /> Ekspor Data Rekapitulasi
          </Button>
        </div>
      </div>

      <div className="overflow-auto rounded border">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-muted uppercase">
            <tr>
              <th className="px-6 py-4 font-semibold">NIM</th>
              <th className="px-6 py-4 font-semibold">Nama Mahasiswa</th>
              <th className="px-6 py-4 font-semibold text-center w-40">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-8 text-muted-foreground">
                  Belum ada mahasiswa.
                </td>
              </tr>
            ) : (
              data.map((mhs) => (
                <tr key={mhs.id} className="border-t hover:bg-muted/20">
                  <td className="px-6 py-4 font-mono">{mhs.nim ?? "-"}</td>
                  <td className="px-6 py-4 font-semibold">{mhs.name ?? "-"}</td>
                  <td className="px-6 py-4 text-center">
                    <LihatDetailButton mahasiswaId={mhs.id} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm">
            Halaman {currentPage} dari {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={currentPage <= 1}
              onClick={() => updateFilter("page", String(currentPage - 1))}
              className="flex items-center gap-2"
            >
              <LuCircleArrowLeft /> Sebelumnya
            </Button>
            <Button
              variant="outline"
              disabled={currentPage >= totalPages}
              onClick={() => updateFilter("page", String(currentPage + 1))}
              className="flex items-center gap-2"
            >
              Selanjutnya <LuCircleArrowRight />
            </Button>
          </div>
        </div>
      )}

      <ExportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} filters={filters} />
    </div>
  );
}
