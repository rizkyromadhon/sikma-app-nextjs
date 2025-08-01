"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useToast } from "@/lib/hooks/use-toast";

export default function FlashMessageListener() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    const loginStatus = searchParams.get("login");
    const registerStatus = searchParams.get("register");
    const logoutStatus = searchParams.get("logout");
    const isLogin = searchParams.get("islogin");
    const semesterStatus = searchParams.get("semester");
    const prodiStatus = searchParams.get("program-studi");
    const golonganStatus = searchParams.get("golongan");
    const mahasiswaStatus = searchParams.get("mahasiswa");
    const dosenStatus = searchParams.get("dosen");
    const ruanganStatus = searchParams.get("ruangan");
    const matkulStatus = searchParams.get("mata-kuliah");
    const jadwalStatus = searchParams.get("jadwal-kuliah");
    const alatStatus = searchParams.get("alat-presensi");
    const exportStatus = searchParams.get("rekapitulasi-kehadiran");
    const profileStatus = searchParams.get("profile");
    const flash = searchParams.get("flash");
    const laporanStatus = searchParams.get("laporan-mahasiswa");
    const passwordStaus = searchParams.get("ganti-password");
    const profileDosenStatus = searchParams.get("dosen_profile");
    const kelolaStatus = searchParams.get("kelola-presensi");
    const pengajuanStatus = searchParams.get("pengajuan_izin");
    const pengajuanDosenStatus = searchParams.get("pengajuan-dosen");
    const rekapStatus = searchParams.get("rekap");
    const pesertaStatus = searchParams.get("peserta-kuliah");

    if (pengajuanDosenStatus === "status_success") {
      toast({
        type: "success",
        title: "Sukses!",
        description: "Status Pengajuan Izin Berhasil diperbarui!.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (pesertaStatus === "create_success") {
      toast({
        type: "success",
        title: "Sukses!",
        description: "Mahasiswa berhasil ditambahkan sebagai peserta.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (pesertaStatus === "delete_success") {
      toast({
        type: "success",
        title: "Sukses!",
        description: "Mahasiswa berhasil dihapus dari peserta.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (pesertaStatus === "user_exists") {
      toast({
        type: "error",
        title: "Gagal!",
        description: "Mahasiswa sudah terdaftar di jadwal kuliah tersebut.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (pesertaStatus === "missing_fields") {
      toast({
        type: "error",
        title: "Gagal!",
        description: "Mahasiswa dan Jadwal Kuliah wajib diisi.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (pesertaStatus === "jadwal_not_found") {
      toast({
        type: "error",
        title: "Gagal!",
        description: "Jadwal Kuliah tidak ditemukan.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (pesertaStatus === "mahasiswa_not_found") {
      toast({
        type: "error",
        title: "Gagal!",
        description: "Mahasiswa tidak ditemukan.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (pesertaStatus === "prodi_mismatch") {
      toast({
        type: "error",
        title: "Gagal!",
        description: "Mahasiswa dan Jadwal Kuliah bukan dari program studi yang sama.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (rekapStatus === "presensi_updated") {
      toast({
        type: "success",
        title: "Sukses!",
        description: "Berhasil mengubah status presensi.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (rekapStatus === "status_success") {
      toast({
        type: "error",
        title: "Gagal!",
        description: "Gagal mengubah status presensi.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (pengajuanStatus === "failed_must_complete") {
      toast({
        type: "error",
        title: "Gagal!",
        description: "Semua field harus diisi.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (pengajuanStatus === "file_important_sick") {
      toast({
        type: "error",
        title: "Gagal!",
        description: "File bukti wajib dilampirkan untuk izin sakit.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (pengajuanStatus === "success") {
      toast({
        type: "success",
        title: "Berhasil!",
        description: "Pengajuan Izin Berhasil Dikirim.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (pengajuanStatus === "error") {
      toast({
        type: "error",
        title: "Gagal!",
        description: "Terdapat kesalahan saat mengirim pengajuan.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (kelolaStatus === "update_status_success") {
      toast({
        type: "success",
        title: "Sukses!",
        description: "Status Presensi Mahasiswa berhasil diubah.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (kelolaStatus === "update_status_failed") {
      toast({
        type: "error",
        title: "Gagal!",
        description: "Ada masalah saat mengubah data presensi.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (profileDosenStatus === "success") {
      toast({
        type: "success",
        title: "Edit Profil Sukses!",
        description: "Profil Berhasil Diperbarui.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (profileDosenStatus === "server_error") {
      toast({
        type: "error",
        title: "Error!",
        description: "Server error.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (profileDosenStatus === "old_password_wrong") {
      toast({
        type: "error",
        title: "Gagal!",
        description: "Password lama salah.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (profileDosenStatus === "password_not_same") {
      toast({
        type: "error",
        title: "Gagal!",
        description: "Password dan konfirmasi password tidak sama.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (profileDosenStatus === "password_6_char") {
      toast({
        type: "error",
        title: "Gagal!",
        description: "Password minimal 6 karakter.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (profileDosenStatus === "password_success") {
      toast({
        type: "success",
        title: "Sukses!",
        description: "Password berhasil diperbarui.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (profileDosenStatus === "error") {
      toast({
        type: "error",
        title: "Gagal!",
        description: "Gagal memperbarui password.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (passwordStaus === "success") {
      toast({
        type: "success",
        title: "Sukses!",
        description: "Password berhasil diganti.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (laporanStatus === "proses") {
      toast({
        type: "success",
        title: "Laporan Diperbarui!",
        description: "Status Laporan diubah ke Diproses.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (laporanStatus === "selesai") {
      toast({
        type: "success",
        title: "Laporan Diperbarui!",
        description: "Status Laporan diubah ke Selesai.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (flash === "laporan_success") {
      toast({
        type: "success",
        title: "Laporan Terkirim!",
        description: "Terima kasih telah melapor. Admin akan segera memproses laporan Anda.",
      });

      // Hapus query setelah toast muncul
      router.replace(pathname, { scroll: false });
    }

    if (profileStatus === "edit_success") {
      toast({
        type: "success",
        title: "Edit profil berhasil!",
        description: "Profil berhasi diperbarui.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (profileStatus === "lengkapi-profil") {
      toast({
        type: "warning",
        title: "Lengkapi Profil!",
        description: "Silahkan lengkapi profil anda untuk melanjutkan.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (loginStatus === "unauthorized") {
      toast({
        type: "error",
        title: "Akses ditolak",
        description: "Silahkan login untuk melanjutkan.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (loginStatus === "success") {
      toast({
        type: "success",
        title: "Login berhasil!",
        description: "Selamat datang kembali di SIKMA.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (registerStatus === "success") {
      toast({
        type: "success",
        title: "Registrasi berhasil!",
        description: "Silahkan login untuk melanjutkan.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (registerStatus === "registered") {
      toast({
        type: "error",
        title: "Registrasi gagal!",
        description: "Email sudah terdaftar.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (logoutStatus === "success") {
      toast({
        type: "success",
        title: "Logout berhasil!",
        description: "Sampai jumpa lagi.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (loginStatus === "notfound") {
      toast({
        type: "error",
        title: "Login gagal!",
        description: "User tidak ditemukan.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (loginStatus === "failed") {
      toast({
        type: "error",
        title: "Login gagal!",
        description: "Email atau password salah.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (isLogin === "true") {
      toast({
        type: "warning",
        title: "Akses ditolak",
        description: "Anda sudah login. Tidak perlu login ulang.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (semesterStatus === "create_success") {
      toast({
        type: "success",
        title: "Semester berhasil ditambahkan!",
        description: "Data semester baru telah berhasil disimpan.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (semesterStatus === "update_success") {
      toast({
        type: "success",
        title: "Semester berhasil diperbarui!",
        description: "Data semester telah berhasil diperbarui.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (semesterStatus === "delete_success") {
      toast({
        type: "success",
        title: "Semester berhasil dihapus!",
        description: "Data semester telah berhasil diperbarui.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (prodiStatus === "create_success") {
      toast({
        type: "success",
        title: "Program Studi berhasil ditambahkan!",
        description: "Data program studi baru telah berhasil disimpan.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (prodiStatus === "update_success") {
      toast({
        type: "success",
        title: "Program Studi berhasil diperbarui!",
        description: "Data program studi telah berhasil diperbarui.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (prodiStatus === "delete_success") {
      toast({
        type: "success",
        title: "Program Studi berhasil dihapus!",
        description: "Data program studi telah berhasil diperbarui.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (golonganStatus === "create_success") {
      toast({
        type: "success",
        title: "Golongan berhasil ditambahkan!",
        description: "Data golongan baru telah berhasil disimpan.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (golonganStatus === "update_success") {
      toast({
        type: "success",
        title: "Golongan berhasil diperbarui!",
        description: "Data golongan telah berhasil diperbarui.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (golonganStatus === "delete_success") {
      toast({
        type: "success",
        title: "Golongan berhasil dihapus!",
        description: "Data golongan telah berhasil diperbarui.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (mahasiswaStatus === "reset_success") {
      toast({
        type: "success",
        title: "Sukses!",
        description: "Password Mahasiswa berhasil direset.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (mahasiswaStatus === "create_success") {
      toast({
        type: "success",
        title: "Mahasiswa berhasil ditambahkan!",
        description: "Data mahasiswa baru telah berhasil disimpan.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (mahasiswaStatus === "update_success") {
      toast({
        type: "success",
        title: "Mahasiswa berhasil diperbarui!",
        description: "Data mahasiswa telah berhasil diperbarui.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (mahasiswaStatus === "delete_success") {
      toast({
        type: "success",
        title: "Mahasiswa berhasil dihapus!",
        description: "Data mahasiswa telah berhasil diperbarui.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (dosenStatus === "create_success") {
      toast({
        type: "success",
        title: "Dosen berhasil ditambahkan!",
        description: "Data dosen baru telah berhasil disimpan.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (dosenStatus === "update_success") {
      toast({
        type: "success",
        title: "Dosen berhasil diperbarui!",
        description: "Data dosen telah berhasil diperbarui.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (dosenStatus === "delete_success") {
      toast({
        type: "success",
        title: "Dosen berhasil dihapus!",
        description: "Data dosen telah berhasil diperbarui.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (ruanganStatus === "create_success") {
      toast({
        type: "success",
        title: "Ruangan berhasil ditambahkan!",
        description: "Data ruangan baru telah berhasil disimpan.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (ruanganStatus === "update_success") {
      toast({
        type: "success",
        title: "Ruangan berhasil diperbarui!",
        description: "Data ruangan telah berhasil diperbarui.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (ruanganStatus === "delete_success") {
      toast({
        type: "success",
        title: "Ruangan berhasil dihapus!",
        description: "Data ruangan telah berhasil diperbarui.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (matkulStatus === "create_success") {
      toast({
        type: "success",
        title: "Mata Kuliah berhasil ditambahkan!",
        description: "Data mata kuliah baru telah berhasil disimpan.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (matkulStatus === "update_success") {
      toast({
        type: "success",
        title: "Mata Kuliah berhasil diperbarui!",
        description: "Data mata kuliah telah berhasil diperbarui.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (matkulStatus === "delete_success") {
      toast({
        type: "success",
        title: "Mata Kuliah berhasil dihapus!",
        description: "Data mata kuliah telah berhasil diperbarui.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (jadwalStatus === "create_success") {
      toast({
        type: "success",
        title: "Jadwal Kuliah berhasil ditambahkan!",
        description: "Data jadwal kuliah baru telah berhasil disimpan.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (jadwalStatus === "update_success") {
      toast({
        type: "success",
        title: "Jadwal Kuliah berhasil diperbarui!",
        description: "Data jadwal kuliah telah berhasil diperbarui.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (jadwalStatus === "delete_success") {
      toast({
        type: "success",
        title: "Jadwal Kuliah berhasil dihapus!",
        description: "Data jadwal kuliah telah berhasil diperbarui.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (alatStatus === "create_success") {
      toast({
        type: "success",
        title: "Alat Presensi berhasil ditambahkan!",
        description: "Data alat presensi baru telah berhasil disimpan.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (alatStatus === "update_success") {
      toast({
        type: "success",
        title: "Alat Presensi berhasil diperbarui!",
        description: "Data alat presensi telah berhasil diperbarui.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (alatStatus === "delete_success") {
      toast({
        type: "success",
        title: "Alat Presensi berhasil dihapus!",
        description: "Data alat presensi telah berhasil diperbarui.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (exportStatus === "export_success") {
      toast({
        type: "success",
        title: "Berhasil!",
        description: "File berhasil diekspor.",
      });
      router.replace(pathname, { scroll: false });
    }

    if (exportStatus === "export_error") {
      toast({
        type: "error",
        title: "Gagal!",
        description: "Terjadi kesalahan saat mengekspor.",
      });
      router.replace(pathname, { scroll: false });
    }
  }, [searchParams, router, pathname, toast]);

  return null;
}
