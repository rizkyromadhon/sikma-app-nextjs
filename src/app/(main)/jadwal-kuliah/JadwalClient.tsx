"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

type Jadwal = {
  day: string;
  start: string;
  end: string;
  matkul: string;
  dosen: string;
  ruangan: string;
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

export default function JadwalClient({ initialJadwal }: { initialJadwal: Jadwal[] }) {
  const [schedule, setSchedule] = useState<Jadwal[]>(initialJadwal);

  return (
    <div className="px-8 md:px-24 py-8 md:py-12 space-y-6">
      <h1 className="text-xl md:text-2xl font-bold text-center text-foreground">Jadwal Kuliah Mahasiswa</h1>

      {/* Desktop */}
      <div className="hidden md:grid grid-cols-6 gap-4 bg-neutral-200 dark:bg-neutral-800 px-4 py-2 rounded-lg mt-12">
        <div className="text-sm font-semibold text-center text-neutral-700 dark:text-muted-foreground">
          Jam / Hari
        </div>
        {days.map((day) => (
          <div
            key={day}
            className="text-sm font-semibold text-center text-neutral-700 dark:text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="hidden md:block md:space-y-6">
        {hours.map((hour) => (
          <div key={hour} className="grid grid-cols-6 gap-4 items-center px-2">
            <div className="text-sm font-mono text-muted-foreground pt-2 flex justify-center">{hour}</div>
            {days.map((day) => {
              const matched = schedule.find((item) => item.day === day && item.start === hour);

              return (
                <Card
                  key={day + hour}
                  className={`min-h-[80px] p-3 text-xs rounded-2xl ${
                    matched
                      ? "bg-muted/30 text-foreground"
                      : "justify-center text-muted-foreground bg-muted/10 italic flex items-center"
                  }`}
                >
                  {matched ? (
                    <div className="space-y-1">
                      <div className="font-semibold truncate">{matched.matkul}</div>
                      <div className="text-muted-foreground text-xs">{matched.dosen}</div>
                      <div className="flex justify-between text-muted-foreground text-xs">
                        <span className="truncate max-w-[60%]">{matched.ruangan}</span>
                        <span>
                          {matched.start} - {matched.end}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center w-full">Kosong</div>
                  )}
                </Card>
              );
            })}
          </div>
        ))}
      </div>

      {/* Mobile */}
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
                      className="p-3 text-sm rounded-xl text-center flex flex-col gap-1 bg-muted/10"
                    >
                      <div className="text-xs text-muted-foreground font-mono">{hour}</div>
                      {matched ? (
                        <>
                          <div className="font-semibold text-foreground">{matched.matkul}</div>
                          <div className="text-muted-foreground">Dosen: {matched.dosen}</div>
                          <div className="text-muted-foreground">{matched.ruangan}</div>
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
    </div>
  );
}
