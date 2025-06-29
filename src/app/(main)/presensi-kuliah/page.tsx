"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import axios from "axios";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Presensi = {
  id: string;
  waktu_presensi: string;
  status: "HADIR" | "TIDAK_HADIR" | "SAKIT" | "IZIN";
  keterangan?: string;
  matkul: string;
};

type MataKuliah = {
  id: string;
  name: string;
};

const PresensiKuliahPage = () => {
  const [presensi, setPresensi] = useState<Presensi[]>([]);
  const [matkulOptions, setMatkulOptions] = useState<MataKuliah[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedMatkul, setSelectedMatkul] = useState<string>("all");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPresensi = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/mahasiswa/presensi");
        setPresensi(res.data);
      } catch (error) {
        console.error("Gagal mengambil data presensi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPresensi();
  }, []);

  useEffect(() => {
    const fetchMatkul = async () => {
      try {
        const res = await axios.get("/api/mahasiswa/matkul");
        setMatkulOptions(res.data);
      } catch (error) {
        console.error("Gagal mengambil daftar mata kuliah:", error);
      }
    };

    fetchMatkul();
  }, []);

  const filteredPresensi = presensi.filter((p) => {
    const matchDate = selectedDate
      ? format(new Date(p.waktu_presensi), "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
      : true;
    const matchMatkul = selectedMatkul && selectedMatkul !== "all" ? p.matkul === selectedMatkul : true;
    return matchDate && matchMatkul;
  });

  const formatStatus = (status: string) =>
    status
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  return (
    <div className="px-6 md:px-24 py-10 space-y-6 min-h-dvh md:min-h-[92dvh]">
      <h1 className="text-xl md:text-3xl font-bold text-center text-foreground">Presensi Kuliah Mahasiswa</h1>

      <Card className="p-4 space-y-4 mt-8 bg-white dark:bg-neutral-900">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          {/* Filter tanggal */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full md:w-[220px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : <span>Pilih tanggal</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
            </PopoverContent>
          </Popover>

          {/* Filter mata kuliah */}
          <Select value={selectedMatkul} onValueChange={setSelectedMatkul}>
            <SelectTrigger className="w-full md:w-80">
              <SelectValue placeholder="Pilih Mata Kuliah" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Mata Kuliah</SelectItem>
              {matkulOptions.map((m) => (
                <SelectItem key={m.id} value={m.name}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tabel presensi */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-neutral-100 dark:bg-neutral-800">
              <TableRow>
                <TableHead className="w-[160px] text-center">Tanggal</TableHead>
                <TableHead className="text-center">Mata Kuliah</TableHead>
                <TableHead className="text-center">Waktu Presensi</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Keterangan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white dark:bg-neutral-900">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center italic text-muted-foreground">
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : filteredPresensi.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center italic text-muted-foreground py-8">
                    Tidak ada data presensi.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPresensi.map((p) => (
                  <TableRow key={p.id} className="hover:bg-neutral-100 dark:hover:bg-neutral-800">
                    <TableCell className="text-center">
                      {format(new Date(p.waktu_presensi), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell className="text-center">{p.matkul}</TableCell>
                    <TableCell className="text-center">
                      {format(new Date(p.waktu_presensi), "HH:mm")}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className={`font-medium px-3 py-1 rounded-full text-sm border-none ${
                          p.status === "HADIR"
                            ? "bg-emerald-200 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100"
                            : p.status === "SAKIT"
                            ? "bg-sky-200 text-sky-800 dark:bg-sky-900 dark:text-sky-100"
                            : p.status === "IZIN"
                            ? "bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                            : "bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-100"
                        }`}
                      >
                        {formatStatus(p.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-sm">{p.keterangan || "-"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default PresensiKuliahPage;
