// app/laporan-saya/page.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

interface Laporan {
  id: string;
  tipe: string;
  pesan: string;
  createdAt: string;
  status: "Diproses" | "Selesai";
  balasan: string;
}

export default function LaporanSaya() {
  const [laporan, setLaporan] = useState<Laporan[] | null>(null);

  useEffect(() => {
    fetch("/api/laporan/saya")
      .then((res) => res.json())
      .then((data) => setLaporan(data));
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6 min-h-[92dvh]">
      <h1 className="text-2xl font-bold mt-10">Laporan Saya</h1>

      {laporan === null ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : laporan.length === 0 ? (
        <p className="text-muted-foreground">Belum ada laporan terkirim.</p>
      ) : (
        laporan.map((lapor) => (
          <Card key={lapor.id}>
            <CardHeader className="flex flex-row justify-between items-start pb-2">
              <CardTitle className="text-base">{lapor.tipe}</CardTitle>
              <Badge variant={lapor.status === "Selesai" ? "default" : "secondary"}>{lapor.status}</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Alasan: {lapor.pesan}</p>
              {lapor.balasan && (
                <p className="text-sm text-muted-foreground">Balasan dari Admin: {lapor.balasan}</p>
              )}
              <p className="text-xs text-gray-400 mt-2">{new Date(lapor.createdAt).toLocaleString()}</p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
