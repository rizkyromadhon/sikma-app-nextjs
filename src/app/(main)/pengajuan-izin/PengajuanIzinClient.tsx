"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PlusIcon } from "lucide-react";
import { ModalAjukanIzin } from "./ModalPengajuanIzin";
import { Badge } from "@/components/ui/badge";

interface Pengajuan {
  id: string;
  tipe: string;
  alasan: string;
  status: "PENDING" | "DISETUJUI" | "DITOLAK";
  createdAt: string;
  tanggal_izin: string;
  jadwal_kuliah: {
    mata_kuliah?: { name: string };
  };
  catatan_dosen: string;
}

interface Jadwal {
  id: string;
  mataKuliah: string;
  jam: string;
  dosen: string | undefined;
  hari: string;
}

export default function PengajuanIzinClient({ jadwals }: { jadwals: Jadwal[] }) {
  const [pengajuans, setPengajuans] = useState<Pengajuan[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPengajuan = async () => {
    try {
      const res = await fetch("/api/pengajuan-izin");
      if (!res.ok) throw new Error("Gagal memuat pengajuan");
      const data = await res.json();
      setPengajuans(data);
    } catch (e) {
      console.error(e);
      setPengajuans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPengajuan();
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 min-h-[92dvh]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Pengajuan Izin</h1>
        <Button onClick={() => setIsModalOpen(true)} className="cursor-pointer">
          <PlusIcon />
          Ajukan Pengajuan Baru
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Memuat pengajuan...</p>
      ) : pengajuans && pengajuans.length > 0 ? (
        <div className="space-y-4">
          {pengajuans.map((pengajuan) => (
            <Card key={pengajuan.id}>
              <CardHeader className="flex flex-row justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{pengajuan.tipe}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground mt-4">
                    {pengajuan.jadwal_kuliah.mata_kuliah?.name}
                    <p className="text-sm text-muted-foreground">
                      Mengajukan izin untuk tanggal:{" "}
                      {new Date(pengajuan.tanggal_izin).toLocaleDateString("id-ID", { dateStyle: "long" })}
                    </p>
                  </CardDescription>
                </div>
                <Badge
                  variant={
                    pengajuan.status === "DISETUJUI"
                      ? "success"
                      : pengajuan.status === "DITOLAK"
                      ? "destructive"
                      : "warning"
                  }
                >
                  {pengajuan.status}
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Alasan: {pengajuan.alasan}</p>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-2 justify-between">
                  <p className="text-sm text-muted-foreground">
                    Diajukan pada:{" "}
                    {new Date(pengajuan.createdAt).toLocaleDateString("id-ID", { dateStyle: "long" })}
                  </p>
                  {pengajuan.catatan_dosen && (
                    <div className="px-4 py-2 bg-blue-400 dark:bg-blue-800/60 rounded-md text-sm text-blue-50 dark:text-blue-200 italic">
                      Catatan dari dosen: "{pengajuan.catatan_dosen}"
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Alert className="bg-yellow-50 dark:bg-yellow-900/10 border-l-4 border-yellow-400">
          <AlertTitle>Belum ada pengajuan</AlertTitle>
          <AlertDescription>
            Anda belum pernah mengajukan izin. Klik tombol &quot;Ajukan Baru&quot; untuk membuat pengajuan
            izin ke dosen.
          </AlertDescription>
        </Alert>
      )}
      <ModalAjukanIzin
        jadwals={jadwals}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSucceed={fetchPengajuan}
      />
    </div>
  );
}
