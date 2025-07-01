"use client";

import { useState, useRef, useTransition } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Textarea } from "@headlessui/react";
import { id } from "date-fns/locale";
import { useRouter } from "next/navigation";

export interface Jadwal {
  id: string;
  mataKuliah: string;
  jam: string;
  dosen: string | undefined;
  hari: string;
}

interface ModalAjukanIzinProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jadwals: Jadwal[];
  onSucceed: () => Promise<void>;
}

export function ModalAjukanIzin({ open, onOpenChange, jadwals, onSucceed }: ModalAjukanIzinProps) {
  const [tanggal, setTanggal] = useState<Date | undefined>();
  const [jadwalId, setJadwalId] = useState<string | undefined>();
  const [pesan, setPesan] = useState("");
  const [tipePengajuan, setTipePengajuan] = useState<"SAKIT" | "IZIN">("IZIN");
  const [fileBukti, setFileBukti] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const hariTerpilih = tanggal ? format(tanggal, "iiii", { locale: id }).toUpperCase() : undefined;
  const jadwalsSesuaiHari = hariTerpilih ? jadwals.filter((j) => j.hari === hariTerpilih) : [];
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!tanggal || !jadwalId || !pesan) {
      router.push("?pengajuan_izin=failed_must_complete");
      return;
    }

    if (tipePengajuan === "SAKIT" && !fileBukti) {
      router.push("?pengajuan_izin=file_important_sick");
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("tanggal_izin", tanggal.toISOString());
        formData.append("jadwalKuliahId", jadwalId);
        formData.append("pesan", pesan);
        formData.append("tipe_pengajuan", tipePengajuan);
        if (fileBukti) formData.append("file_bukti", fileBukti);

        const res = await fetch("/api/pengajuan-izin", { method: "POST", body: formData });
        if (!res.ok) throw new Error("Gagal mengajukan izin");

        await onSucceed();
        router.push("?pengajuan_izin=success");
        setTanggal(undefined);
        setJadwalId(undefined);
        setPesan("");
        setTipePengajuan("IZIN");
        setFileBukti(null);

        formRef.current?.reset();
        onOpenChange(false);
        onOpenChange(false);
      } catch (err: any) {
        console.error(err);
        router.push("?pengajuan_izin=error");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajukan Pengajuan Izin</DialogTitle>
        </DialogHeader>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm mb-1 block">Tipe Pengajuan</label>
            <Select value={tipePengajuan} onValueChange={(val: "SAKIT" | "IZIN") => setTipePengajuan(val)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih tipe pengajuan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IZIN">Izin</SelectItem>
                <SelectItem value="SAKIT">Sakit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm mb-1 block">Tanggal Izin</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left", !tanggal && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {tanggal ? format(tanggal, "PPP") : <span>Pilih tanggal izin</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-auto p-0">
                <Calendar mode="single" selected={tanggal} onSelect={setTanggal} />
              </PopoverContent>
            </Popover>
          </div>

          {/* Jadwal Kuliah */}
          <div>
            <label className="text-sm mb-1 block">Jadwal Kuliah</label>
            <Select value={jadwalId} onValueChange={setJadwalId} disabled={!tanggal}>
              <SelectTrigger className="w-full max-w-116">
                <SelectValue placeholder={tanggal ? "Pilih jadwal kuliah" : "Pilih tanggal dulu"} />
              </SelectTrigger>
              <SelectContent>
                {tanggal ? (
                  jadwalsSesuaiHari.length > 0 ? (
                    jadwalsSesuaiHari.map((j) => (
                      <SelectItem key={j.id} value={j.id}>
                        <div className="text-sm font-semibold">{j.mataKuliah}</div>
                        <div className="text-xs text-muted-foreground">
                          - {j.jam} - {j.dosen}
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-xs text-muted-foreground">Tidak ada jadwal di hari ini</div>
                  )
                ) : (
                  <div className="p-2 text-xs text-muted-foreground">Pilih tanggal dulu</div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Alasan */}
          <div>
            <label className="text-sm mb-1 block">Alasan</label>
            <Textarea
              required
              placeholder="Tulis alasan izin..."
              value={pesan}
              onChange={(e) => setPesan(e.target.value)}
              className="px-4 py-2 text-sm text-neutral-700 dark:text-neutral-400 block bg-muted/40 border border-neutral-200 dark:border-neutral-700 w-full rounded-md focus:outline-none focus:shadow-[0_0_2px_2px] shadow-neutral-400/80 transition-all duration-200 ease-in-out"
            />
          </div>

          {/* File Bukti */}
          <div>
            <label className="text-sm mb-1 block">
              File Bukti {tipePengajuan === "SAKIT" && <span className="text-red-600">*</span>}
            </label>
            <Input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setFileBukti(e.target.files?.[0] || null)}
            />
            {tipePengajuan === "IZIN" && (
              <p className="text-xs text-muted-foreground mt-2">*Opsional untuk tipe izin.</p>
            )}
            {tipePengajuan === "SAKIT" && (
              <p className="text-xs text-red-600 mt-2">
                *Untuk pengajuan sakit, wajib menyertakan surat keterangan dari dokter/klinik.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Mengirim..." : "Kirim Pengajuan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
