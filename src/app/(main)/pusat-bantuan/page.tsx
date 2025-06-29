"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";

const bantuanList = [
  {
    question: "Bagaimana cara melakukan presensi dengan kartu RFID?",
    answer:
      "Tempelkan kartu RFID Anda ke alat presensi di kelas. Sistem akan secara otomatis mencatat kehadiran Anda jika kartu RFID Anda sudah terdaftar.",
  },
  {
    question: "Apa yang harus dilakukan jika kartu RFID saya hilang atau rusak?",
    answer:
      "Segera laporkan ke admin program studi untuk permintaan penggantian kartu. Kartu baru akan diberikan dan data RFID Anda akan diperbarui.",
  },
  {
    question: "Mengapa presensi saya tidak tercatat?",
    answer:
      "Pastikan anda melakukan presensi sesuai jadwal. Jika sudah benar namun tidak tercatat, hubungi admin program studi.",
  },
  {
    question: "Saya sudah punya kartu RFID tapi tidak bisa melakukan presensi, kenapa?",
    answer:
      "Kemungkinan besar kartu Anda belum terdaftar di sistem. Silakan hubungi admin atau bagian akademik untuk mendaftarkan kartu Anda ke akun mahasiswa.",
  },
  {
    question: "Bagaimana cara melihat riwayat presensi saya?",
    answer:
      "Anda dapat melihatnya melalui menu 'Presensi Kuliah' di dashboard. Di sana tersedia riwayat lengkap presensi Anda beserta tanggal, waktu, dan status kehadiran.",
  },
  {
    question: "Apa arti dari status presensi seperti HADIR, TERLAMBAT, IZIN, dan SAKIT?",
    answer:
      "Status menunjukkan kondisi kehadiran Anda pada waktu tertentu: HADIR berarti tepat waktu, TERLAMBAT jika melebihi toleransi waktu, IZIN/SAKIT jika Anda mengajukan ketidakhadiran disertai bukti dan disetujui oleh dosen terkait.",
  },
  {
    question: "Apakah saya bisa presensi menggunakan kartu teman saya?",
    answer: "Tidak. Sistem mencatat data berdasarkan data mahasiswa yang terhubung dengan RFID.",
  },
  {
    question: "Apa yang terjadi jika saya lupa membawa kartu RFID?",
    answer:
      "Silakan laporkan ke dosen pengajar mata kuliah atau admin program studi. Presensi manual dapat dilakukan hanya dalam kondisi tertentu atau dosen mengizinkan.",
  },
  {
    question: "Teknologi apa yang digunakan dalam sistem ini?",
    answer:
      "Sistem ini menggunakan teknologi RFID untuk mengidentifikasi kartu RFID mahasiswa dan Nextjs sebagai framework utama.",
  },
];

export default function PusatBantuanPage() {
  const [search, setSearch] = useState("");

  const filtered = bantuanList.filter(
    (item) =>
      item.question.toLowerCase().includes(search.toLowerCase()) ||
      item.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-dvh md:min-h-[92dvh] px-6 md:px-24 py-10 space-y-6 mb-20">
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Pusat Bantuan</h1>
        <p className="text-muted-foreground">Temukan Jawaban dan Panduan Seputar Sistem Presensi Mahasiswa</p>
      </div>

      <Input
        placeholder="Cari pertanyaan..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full md:w-1/2 mx-auto"
      />

      <ScrollArea className=" max-w-[50rem] mx-auto">
        <Accordion type="single" collapsible className="w-full">
          {(filtered.length > 0
            ? filtered
            : [{ question: "Tidak ditemukan", answer: "Silakan coba kata kunci lain." }]
          ).map((item, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger className="text-left text-base font-medium text-foreground transition-none">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollArea>
    </div>
  );
}
