"use client";

import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useEffect, useState } from "react";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import JadwalCard from "@/components/ui/jadwal-kuliah/JadwalCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FaUserCircle } from "react-icons/fa";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";

type Jadwal = {
  day: string;
  start: string;
  end: string;
  matkul: string;
  dosen: string;
  ruangan: string;
  foto: string;
};

const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
const hours = [
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];
const getHourIndex = (hour: string) => hours.findIndex((h) => h === hour) + 1;

const getRowSpan = (start: string, end: string): [number, number] => {
  const startIdx = getHourIndex(start);
  const endIdx = getHourIndex(end);
  return [startIdx, endIdx + 1]; // supaya mencakup sampai baris akhir
};

const JadwalKuliahPage = () => {
  const [schedule, setSchedule] = useState<Jadwal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJadwal, setSelectedJadwal] = useState<Jadwal | null>(null);

  useEffect(() => {
    const fetchJadwal = async () => {
      try {
        const res = await axios.get<Jadwal[]>("/api/mahasiswa/jadwal");
        setSchedule(res.data);
      } catch (error) {
        console.error("Gagal mengambil data jadwal:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJadwal();
  }, []);

  return (
    <div className="px-8 md:px-24 py-8 md:py-12 space-y-6 min-h-[92dvh]">
      <h1 className="text-xl md:text-3xl font-bold text-center text-foreground">Jadwal Kuliah Mahasiswa</h1>

      {/* Grid Header */}
      <div className="hidden md:grid grid-cols-[100px_repeat(5,minmax(0,1fr))] gap-4 bg-neutral-100 dark:bg-neutral-900 rounded-lg px-4 py-2 mt-8">
        <div className="text-sm font-semibold text-center text-neutral-700 dark:text-neutral-300">Jam</div>
        {days.map((day) => (
          <div key={day} className="text-sm font-semibold text-center text-neutral-700 dark:text-neutral-300">
            {day}
          </div>
        ))}
      </div>

      {loading ? (
        <div className="hidden md:grid grid-cols-[100px_repeat(5,minmax(0,1fr))] gap-4 relative">
          <div className="grid grid-rows-11 gap-4">
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-20 flex items-center justify-center text-sm font-mono text-muted-foreground"
              >
                {hour}
              </div>
            ))}
          </div>
          {days.map((day) => (
            <div key={day} className="grid grid-rows-11 gap-4">
              {hours.map((_, i) => (
                <Skeleton
                  key={`skeleton-${day}-${i}`}
                  className="h-20 w-full rounded-2xl bg-neutral-200 dark:bg-neutral-900"
                />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="hidden md:grid grid-cols-[100px_repeat(5,minmax(0,1fr))] gap-4 relative">
          <div className="grid grid-rows-11 gap-4">
            {hours.map((hour) => (
              <div
                key={hour}
                className="border-b border-neutral-200 dark:border-neutral-800 text-sm font-mono text-neutral-700 dark:text-neutral-300 flex items-center justify-center h-20"
              >
                {hour}
              </div>
            ))}
          </div>

          {/* Kolom Hari */}
          {days.map((day) => {
            const events = schedule.filter((item) => item.day === day);
            const filledRows = new Set<number>();

            return (
              <div key={day} className="relative grid grid-rows-11 gap-4">
                {events.map((item, idx) => {
                  const [startRow, endRow] = getRowSpan(item.start, item.end);
                  for (let i = startRow; i < endRow; i++) {
                    filledRows.add(i);
                  }

                  return (
                    <div
                      key={`event-${idx}`}
                      style={{ gridRow: `${startRow} / ${endRow}` }}
                      className="h-full"
                      onClick={() => setSelectedJadwal(item)}
                    >
                      <JadwalCard
                        matkul={item.matkul}
                        dosen={item.dosen}
                        ruangan={item.ruangan}
                        start={item.start}
                        end={item.end}
                        className="h-full min-h-[80px] w-59 overflow-hidden rounded-2xl"
                      />
                    </div>
                  );
                })}

                {hours.map((_, i) => {
                  const row = i + 1;
                  if (filledRows.has(row)) return null;

                  return (
                    <div key={`empty-${row}`} style={{ gridRow: `${row}` }}>
                      <Card className="min-h-[80px] w-59 text-xs rounded-2xl italic text-muted-foreground bg-muted/10 flex items-center justify-center">
                        Kosong
                      </Card>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {/* Tampilan Mobile: Accordion per Hari */}
      <div className="md:hidden space-y-4">
        <Accordion type="single" collapsible className="w-full">
          {days.map((day) => (
            <AccordionItem key={day} value={day}>
              <AccordionTrigger className="text-base font-semibold text-foreground">{day}</AccordionTrigger>
              <AccordionContent className="space-y-2">
                {hours.map((hour) => {
                  const matched = schedule.find((item) => item.day === day && item.start === hour);
                  return (
                    <Card
                      key={day + hour}
                      onClick={() => matched && setSelectedJadwal(matched)}
                      className={`p-3 text-sm rounded-xl text-center flex flex-col gap-1 bg-neutral-950 ${
                        matched ? "cursor-pointer hover:bg-neutral-950 transition" : ""
                      }`}
                    >
                      <div className="text-xs text-muted-foreground font-mono">{hour}</div>
                      {loading ? (
                        <>
                          <Skeleton className="h-4 w-3/4 mx-auto" />
                          <Skeleton className="h-3 w-1/2 mx-auto" />
                          <Skeleton className="h-3 w-1/2 mx-auto" />
                        </>
                      ) : matched ? (
                        <>
                          <div className="font-semibold text-foreground truncate">{matched.matkul}</div>
                          <div className="text-muted-foreground truncate">Dosen: {matched.dosen}</div>
                          <div className="text-muted-foreground truncate">{matched.ruangan}</div>
                          <div className="text-muted-foreground">
                            {matched.start} - {matched.end}
                          </div>
                        </>
                      ) : (
                        <div className="italic text-muted-foreground">Kosong</div>
                      )}
                    </Card>
                  );
                })}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <Dialog open={!!selectedJadwal} onOpenChange={() => setSelectedJadwal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedJadwal?.matkul}</DialogTitle>
          </DialogHeader>

          {/* Konten custom, tidak lagi dalam <DialogDescription> */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-6 mt-2">
            <div className="w-24 h-24 sm:w-30 sm:h-30 rounded-full overflow-hidden bg-muted flex-shrink-0 border border-neutral-300 dark:border-neutral-800">
              {" "}
              {selectedJadwal?.foto === undefined ? (
                <Skeleton className="w-full h-full" />
              ) : selectedJadwal?.foto ? (
                <Image
                  src={selectedJadwal.foto}
                  alt={selectedJadwal.dosen}
                  width={100}
                  height={100}
                  className="object-cover w-full h-auto"
                />
              ) : (
                <FaUserCircle className="text-4xl text-muted-foreground" />
              )}
            </div>

            <div className="space-y-1 flex-1">
              <div className="text-neutral-700 dark:text-neutral-300 font-bold text-sm truncate md:text-base text-center md:text-start">
                {selectedJadwal?.dosen}
              </div>
              <div className="mt-4 space-y-1 text-sm">
                <div className="text-neutral-700 dark:text-neutral-300">
                  <strong>Hari:</strong> {selectedJadwal?.day}
                </div>
                <div className="text-neutral-700 dark:text-neutral-300">
                  <strong>Jam:</strong> {selectedJadwal?.start} - {selectedJadwal?.end}
                </div>
                <div className="text-neutral-700 dark:text-neutral-300">
                  <strong>Ruangan:</strong> {selectedJadwal?.ruangan}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JadwalKuliahPage;
