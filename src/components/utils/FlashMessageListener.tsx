// src/components/util/FlashMessageListener.tsx

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
    // Cek apakah parameter 'login=success' ada di URL
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

    if (loginStatus === "unauthorized") {
      toast({
        type: "error",
        title: "Akses ditolak",
        description: "Anda harus login terlebih dahulu.",
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
  }, [searchParams, router, pathname, toast]);

  return null;
}
