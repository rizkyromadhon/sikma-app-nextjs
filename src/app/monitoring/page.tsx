import ThemeToggle from "@/components/features/ToggleTheme";
import Link from "next/link";
import ClientOnly from "@/components/shared/ClientOnly";
import MonitoringClient from "./MonitoringClient";

export default function MonitoringPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <div className="w-full bg-white dark:bg-black h-16 flex items-center justify-between px-6 md:px-12 shadow-md">
        <Link href="/">
          <h1 className="text-xl font-bold tracking-tight">'SIKMA'</h1>
        </Link>
        <div className="flex items-center gap-6">
          <span className="text-sm text-neutral-800 dark:text-neutral-300 ">
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          <ThemeToggle style="shadow-[0_0_12px] shadow-neutral-400 dark:shadow-neutral-700" />
        </div>
      </div>

      <ClientOnly>
        <MonitoringClient />
      </ClientOnly>
    </div>
  );
}
