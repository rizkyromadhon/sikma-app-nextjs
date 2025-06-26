import Navbar from "@/components/layouts/Navbar";
import Footer from "@/components/layouts/Footer";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <Navbar />

      <main className=" bg-white text-black dark:bg-black dark:text-white flex-1">{children}</main>

      <Footer />
    </div>
  );
}
