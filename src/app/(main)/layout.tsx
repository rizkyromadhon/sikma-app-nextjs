import Navbar from "@/components/layouts/Navbar";
import Footer from "@/components/layouts/Footer";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col flex-grow">
      <Navbar />
      <main className="bg-white text-black dark:bg-neutral-900/30 dark:text-white flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
