"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@headlessui/react";
import axios from "axios";
import { User2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

interface PengajuanCardProps {
  id: string;
  pesan: string;
  file_bukti: string | null;
  tanggal_izin: string;
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

function PengajuanCard({
  pengajuan,
  currentStatus,
}: // onActionSuccess,
{
  pengajuan: PengajuanCardProps;
  currentStatus: string;
  // onActionSuccess: () => void;
}) {
  return (
    <Card key={pengajuan.id} className="p-5 bg-white dark:bg-neutral-800/50">
      <div className="flex items-start gap-4">
        {pengajuan.mahasiswa.foto ? (
          <Image
            src={pengajuan.mahasiswa.foto}
            alt="Foto"
            width={48}
            height={48}
            className="rounded-full object-cover w-12 h-12"
          />
        ) : (
          <div className="rounded-full bg-muted flex items-center justify-center w-12 h-12">
            <User2 className="text-muted-foreground" />
          </div>
        )}

        <div className="flex-1">
          <div className="flex items-center justify-between flex-wrap">
            <div>
              <p className="font-bold">{pengajuan.mahasiswa.name}</p>
              <p className="text-xs text-muted-foreground">{pengajuan.mahasiswa.nim}</p>
            </div>
            <span
              className={`text-xs font-semibold px-4 py-2 rounded-full ${
                pengajuan.tipe_pengajuan === "IZIN"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
              }`}
            >
              {pengajuan.tipe_pengajuan}
            </span>
          </div>

          <div className="mt-3 text-sm bg-muted/40 p-3 rounded-md">
            <p className="font-semibold">Pesan Pengajuan:</p>
            <p className="whitespace-pre-wrap">{pengajuan.pesan}</p>
          </div>

          {pengajuan.file_bukti && (
            <div className="mt-2">
              <a
                href={pengajuan.file_bukti}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline"
              >
                <i className="fas fa-paperclip mr-1"></i>Lihat File Bukti
              </a>
            </div>
          )}

          <div className="mt-3 text-xs text-muted-foreground space-y-1 border-t pt-2">
            <p>
              <i className="fas fa-book fa-fw mr-2"></i>Mata Kuliah:{" "}
              <span className="font-medium text-foreground">{pengajuan.jadwal_kuliah.mata_kuliah.name}</span>
            </p>
            <p>
              <i className="fas fa-calendar-day fa-fw mr-2"></i>Tanggal Izin:{" "}
              <span className="font-medium text-foreground">{pengajuan.tanggal_izin}</span>
            </p>
          </div>

          {currentStatus === "DIPROSES" && <FormCatatan pengajuan={pengajuan} />}
        </div>
      </div>
    </Card>
  );
}

const FormCatatan = ({ pengajuan }: { pengajuan: PengajuanCardProps }) => {
  const router = useRouter();
  const [catatan, setCatatan] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (id: string, status: "DISETUJUI" | "DITOLAK") => {
    setIsSubmitting(true);
    try {
      const response = await axios.put(`/api/dosen/pengajuan-izin/${id}/status`, {
        status,
        catatan_dosen: catatan,
      });

      console.log(response);
      if (response.status === 200) {
        router.push("?pengajuan-dosen=status_success");
      }
    } catch (e: any) {
      console.error(e);
      router.push("?pengajuan-dosen=error");
    } finally {
      setIsSubmitting(false);
      setCatatan("");
    }
  };
  return (
    <div className="mt-4 pt-4 border-t flex flex-col sm:flex-row justify-end gap-3">
      <Input
        type="text"
        placeholder="Tambahkan catatan (opsional)..."
        onChange={(e) => setCatatan(e.target.value)}
        className="w-full sm:flex-1 px-4 py-2 text-sm rounded-md border border-neutral-300 dark:border-neutral-700"
      />
      <div className="flex gap-3">
        <Button
          onClick={() => handleSubmit(pengajuan.id, "DITOLAK")}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-800/70 dark:hover:bg-red-900 rounded-lg transition-colors"
        >
          Tolak
        </Button>
        <Button
          onClick={() => handleSubmit(pengajuan.id, "DISETUJUI")}
          className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-800 dark:hover:bg-emerald-900 rounded-lg transition-colors"
        >
          Setujui
        </Button>
      </div>
    </div>
  );
};

export default PengajuanCard;
