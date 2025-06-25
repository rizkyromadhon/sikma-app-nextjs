"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { format, parseISO } from "date-fns";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { LuArrowLeft } from "react-icons/lu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";

// Type Definitions

type Mahasiswa = {
  id: string;
  name: string;
  nim: string;
  prodi?: { name: string };
  semester?: { name: string };
  golongan?: { name: string };
};

type PresensiStatus = "HADIR" | "TIDAK_HADIR" | "IZIN" | "SAKIT";

type PresensiItem = {
  id: string;
  waktu_presensi: string;
  status: PresensiStatus;
  matkul?: { name: string };
};

type Matkul = {
  id: string;
  name: string;
};

export default function PresensiDetailPage() {
  const { id: mahasiswaId } = useParams();
  const [mahasiswa, setMahasiswa] = useState<Mahasiswa | null>(null);
  const [presensi, setPresensi] = useState<PresensiItem[]>([]);
  const [matkuls, setMatkuls] = useState<Matkul[]>([]);
  const [selectedMatkul, setSelectedMatkul] = useState<string>("");
  const [filter, setFilter] = useState({ from: "", to: "" });
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [changed, setChanged] = useState<Record<string, PresensiStatus>>({});
  const [loadingMahasiswa, setLoadingMahasiswa] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setLoadingMahasiswa(true);
    try {
      const res = await axios.get(`/api/rekap/${mahasiswaId}`, {
        params: {
          from: filter.from,
          to: filter.to,
          matkulId: selectedMatkul || undefined,
        },
      });

      const { mahasiswa, presensi, semesterId } = res.data;

      setMahasiswa(mahasiswa);
      setPresensi(presensi);

      if (semesterId) {
        const matkulRes = await axios.get(`/api/rekap/get-matkul-options?semesterId=${semesterId}`);
        setMatkuls(matkulRes.data);
      }
    } catch (err) {
      console.error("Gagal memuat data:", err);
    } finally {
      setLoading(false);
      setLoadingMahasiswa(false);
    }
  }, [mahasiswaId, filter.from, filter.to, selectedMatkul]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusChange = (id: string, newStatus: PresensiStatus) => {
    setPresensi((prev) => prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p)));
    setChanged((prev) => ({ ...prev, [id]: newStatus }));
  };

  const handleSave = async () => {
    setUpdating(true);
    try {
      const updates = Object.entries(changed).map(([id, status]) => ({
        id,
        status,
      }));

      await axios.post("/api/rekap/update-presensi", updates);
      setChanged({});
      alert("Perubahan berhasil disimpan.");
    } catch (err) {
      console.error("Gagal menyimpan:", err);
      alert("Gagal menyimpan data.");
    } finally {
      setUpdating(false);
    }
  };

  const statusOptions: PresensiStatus[] = ["HADIR", "TIDAK_HADIR", "IZIN", "SAKIT"];

  return (
    <div className="w-full mx-auto py-6">
      <Breadcrumb className="ml-16 mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/admin/dashboard">Admin</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbLink asChild>
            <Link href="#">Manajemen Presensi</Link>
          </BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbLink asChild>
            <Link href="/admin/manajemen-presensi/registrasi-rfid">Registrasi RFID</Link>
          </BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Detail Presensi</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="px-12">
        <div className="flex items-center mb-6 gap-4">
          <LuArrowLeft className="text-2xl cursor-pointer" onClick={() => window.history.back()} />
          <h1 className="text-2xl font-semibold">Detail Presensi Mahasiswa</h1>
        </div>

        {loadingMahasiswa ? (
          <Card className="mb-6 p-4 space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </Card>
        ) : (
          mahasiswa && (
            <Card className="mb-6 p-4">
              <p className="font-medium text-lg">
                {mahasiswa.name} ({mahasiswa.nim})
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {mahasiswa.prodi?.name} / {mahasiswa.semester?.name} / Gol. {mahasiswa.golongan?.name}
              </p>
            </Card>
          )
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm mb-1">Dari Tanggal</label>
            <Input
              type="date"
              value={filter.from}
              onChange={(e) => setFilter((f) => ({ ...f, from: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Sampai Tanggal</label>
            <Input
              type="date"
              value={filter.to}
              onChange={(e) => setFilter((f) => ({ ...f, to: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Mata Kuliah</label>
            <Select value={selectedMatkul || undefined} onValueChange={(val) => setSelectedMatkul(val)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Semua Mata Kuliah" />
              </SelectTrigger>
              <SelectContent>
                {matkuls.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border rounded-md">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="p-2 text-center">Tanggal</th>
                <th className="p-2 text-center">Waktu</th>
                <th className="p-2 text-center">Mata Kuliah</th>
                <th className="p-2 text-center">Status</th>
                <th className="p-2 text-center">Ubah Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center p-4">
                    Memuat data...
                  </td>
                </tr>
              ) : presensi.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-4 text-gray-500">
                    Tidak ada data.
                  </td>
                </tr>
              ) : (
                presensi.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="p-2 text-center">{format(parseISO(p.waktu_presensi), "dd/MM/yyyy")}</td>
                    <td className="p-2 text-center">{format(parseISO(p.waktu_presensi), "HH:mm:ss")}</td>
                    <td className="p-2 text-center">{p.matkul?.name}</td>
                    <td className="p-2 text-center">{p.status}</td>
                    <td className="p-2 text-center">
                      <select
                        value={p.status}
                        onChange={(e) => handleStatusChange(p.id, e.target.value as PresensiStatus)}
                        className="border px-2 py-1 rounded"
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s} className="bg-white dark:bg-neutral-950">
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {Object.keys(changed).length > 0 && (
          <div className="mt-6 text-right">
            <SubmitButton
              text={updating ? "Menyimpan..." : "Simpan Perubahan"}
              onClick={handleSave}
              isLoading={updating}
              className="bg-green-600 text-white px-4 py-2 rounded"
            />
          </div>
        )}
      </div>
    </div>
  );
}
