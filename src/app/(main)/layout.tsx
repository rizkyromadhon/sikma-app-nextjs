import type { Metadata } from "next";
import Navbar from "@/components/layouts/Navbar";

export const metadata: Metadata = {
  title: "SIKMA - Sistem Kehadiran Mahasiswa",
  description: "Generated by create next app",
};

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-grow bg-white text-black dark:bg-black dark:text-white">{children}</main>
    </>
  );
}
