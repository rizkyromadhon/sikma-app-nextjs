import NavbarDosen from "@/components/layouts/dosen/NavbarDosen";
import ClientWrapperDosen from "@/components/layouts/dosen/ClientWrapperDosen";

export default function DosenLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-rows-[auto_1fr] h-screen overflow-hidden bg-white dark:bg-black/20">
      <NavbarDosen />
      <ClientWrapperDosen>{children}</ClientWrapperDosen>
    </div>
  );
}
