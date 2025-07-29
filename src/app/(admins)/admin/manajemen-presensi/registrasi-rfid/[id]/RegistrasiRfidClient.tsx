"use client";

import { useState, useEffect, useRef } from "react";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { LuCircleCheck, LuCircleX, LuInfo, LuLoader } from "react-icons/lu";

type MahasiswaData = {
  id: string;
  name: string | null;
  nim: string | null;
  uid: string | null;
};

interface RegistrasiProps {
  initialMahasiswa: MahasiswaData;
  alatId: string;
}

export default function RegistrasiRfidPageClient({ initialMahasiswa, alatId }: RegistrasiProps) {
  const [currentUid, setCurrentUid] = useState<string | null>(initialMahasiswa.uid);
  const [status, setStatus] = useState<"viewing" | "waiting" | "success" | "used" | "error">(() =>
    initialMahasiswa.uid ? "viewing" : "waiting"
  );
  const [usedByName, setUsedByName] = useState<string | null>(null);

  const registrationModeActivated = useRef(false);

  const handleStartNewRegistration = () => {
    setStatus("waiting");
    // setCurrentUid(null);
  };

  useEffect(() => {
    if (status === "waiting") {
      registrationModeActivated.current = true;
      console.log("Memulai sesi registrasi, mengubah mode alat...");
      fetch(`/api/alat-presensi/${alatId}/set-mode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "REGISTRASI", mahasiswaId: initialMahasiswa.id }),
      });
    }

    return () => {
      if (registrationModeActivated.current) {
        console.log("Meninggalkan halaman, mengembalikan mode alat...");
        const payload = JSON.stringify({ mode: "PRESENSI" });
        const url = `/api/alat-presensi/${alatId}/set-mode`;

        if (navigator.sendBeacon) {
          navigator.sendBeacon(url, new Blob([payload], { type: "application/json" }));
        } else {
          fetch(url, {
            method: "POST",
            body: payload,
            headers: { "Content-Type": "application/json" },
            keepalive: true,
          });
        }
      }
    };
  }, [status, alatId, initialMahasiswa.id]);

  useEffect(() => {
    if (status !== "waiting") return;

    const socket = new WebSocket("wss://sikma-websocket-server.onrender.com");

    socket.onopen = () => {
      console.log("Browser terhubung ke server WebSocket!");
    };

    socket.onmessage = (event) => {
      try {
        const messageData = JSON.parse(event.data);
        console.log("Menerima pesan dari server:", messageData);

        if (messageData.event === "registration-result" && messageData.mahasiswaId === initialMahasiswa.id) {
          if (messageData.status === "success") {
            setCurrentUid(messageData.uid);
            setStatus("success");
          } else if (messageData.status === "used") {
            setStatus("used");
            setUsedByName(messageData.usedByName || null);
          }
        }
      } catch (e) {
        console.error("Gagal mem-parsing pesan WebSocket:", e);
      }
    };

    socket.onclose = () => {
      console.log("Koneksi WebSocket browser ditutup.");
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [status, initialMahasiswa.id]);

  const getPageContainerClass = () => {
    const baseClass =
      "w-full max-w-2xl mt-10 mb-10 mx-auto p-8 bg-white dark:bg-black/20 rounded-xl transition-all duration-500";
    switch (status) {
      case "waiting":
        return `${baseClass} shadow-[0_0_30px_1px] shadow-sky-500/80 dark:shadow-sky-800`;
      case "success":
        return `${baseClass} shadow-[0_0_40px_1px] shadow-emerald-400 dark:shadow-emerald-800/80`;
      case "used":
        return `${baseClass} shadow-[0_0_40px_1px] shadow-red-400 dark:shadow-red-800/80`;
      default:
        return `${baseClass} shadow-lg`;
    }
  };

  const InfoField = ({ label, value }: { label: string; value: string | null | undefined }) => (
    <div className="py-3 px-2 border-b border-gray-400 dark:border-neutral-800 last:border-b-0">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="font-semibold text-lg">{value || "-"}</p>
    </div>
  );

  return (
    <div className={getPageContainerClass()}>
      <h1 className="text-2xl font-bold mb-2">Registrasi Kartu RFID</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        {status === "waiting" && "Sistem sedang menunggu pemindaian kartu RFID baru..."}
        {status === "success" && (
          <span className="text-green-500">Registrasi UID baru berhasil dilakukan!</span>
        )}
        {status === "viewing" && (
          <span className="text-amber-500">Mahasiswa ini sudah memiliki UID terdaftar.</span>
        )}
        {status === "used" && (
          <span className="text-red-500">
            Gagal: UID yang dipindai sudah digunakan oleh {usedByName || "-"}.
          </span>
        )}
      </p>
      <div className="space-y-6">
        <div className="p-4 bg-gray-50 dark:bg-neutral-900 rounded-lg">
          <InfoField label="Nama Mahasiswa" value={initialMahasiswa.name} />
          <InfoField label="NIM" value={initialMahasiswa.nim} />
          <InfoField label="UID Kartu Terdaftar" value={currentUid} />
        </div>

        <div className="p-6 text-center border-2 border-dashed dark:border-neutral-700 rounded-lg min-h-[160px] flex flex-col justify-center">
          {status === "viewing" && (
            <>
              <LuInfo className="h-12 w-12 text-amber-500 mx-auto" />
              <h2 className="mt-4 text-xl font-semibold text-amber-500">UID Sudah Terdaftar</h2>
              <p className="mt-2 text-sm text-neutral-500">
                Klik tombol di bawah jika Anda ingin mengganti dengan kartu baru.
              </p>
              <div className="mt-4">
                <SubmitButton
                  text="Daftarkan UID Baru"
                  onClick={handleStartNewRegistration}
                  className="px-4 py-2 bg-black dark:bg-gray-200 border rounded-lg text-sm text-gray-200 dark:text-black hover:opacity-80 hover:transition-all"
                />
              </div>
            </>
          )}
          {status === "waiting" && (
            <>
              <LuLoader className="animate-spin h-12 w-12 text-sky-500 mx-auto" />
              <h2 className="mt-4 text-xl font-semibold">Menunggu Kartu...</h2>
              <p className="mt-1 text-sm text-neutral-500">
                Silakan tempelkan kartu RFID baru pada alat presensi.
              </p>
            </>
          )}
          {status === "success" && (
            <>
              <LuCircleCheck className="h-12 w-12 text-green-500 mx-auto" />
              <h2 className="mt-4 text-xl font-semibold text-green-500">Registrasi Berhasil!</h2>
              <p className="mt-1 text-sm text-neutral-500">Kartu RFID baru telah berhasil didaftarkan.</p>
            </>
          )}
          {status === "used" && (
            <>
              <LuCircleX className="h-12 w-12 text-red-500 mx-auto" />
              <h2 className="mt-4 text-xl font-semibold text-red-500">UID sudah digunakan</h2>
              <p className="mt-2 text-sm text-gray-500">UID ini telah didaftarkan oleh mahasiswa lain</p>
              <div className="mt-4">
                <SubmitButton
                  text="Coba Lagi"
                  onClick={handleStartNewRegistration}
                  className="px-4 py-2 bg-black dark:bg-gray-200 border rounded-lg text-sm text-gray-200 dark:text-black hover:opacity-80 hover:transition-all "
                />
              </div>
            </>
          )}
        </div>
        <div className="flex justify-end pt-2">
          <SubmitButton
            text="Kembali ke Daftar"
            href="/admin/manajemen-presensi/registrasi-rfid"
            className="px-4 py-2 bg-black dark:bg-gray-200 border rounded-lg text-sm text-gray-200 dark:text-black hover:opacity-80 hover:transition-all"
          />
        </div>
      </div>
    </div>
  );
}
