import NavbarAdmin from "@/components/layouts/admin/NavbarAdmin";
import ClientWrapper from "@/components/layouts/admin/ClientWrapper";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-rows-[auto_1fr] h-screen overflow-hidden">
      <NavbarAdmin />
      <ClientWrapper>{children}</ClientWrapper>
    </div>
  );
}
