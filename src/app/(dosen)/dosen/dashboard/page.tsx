import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Dashboard from "./DashboardDosen";

export default async function DosenDashboardPage() {
  const session = await auth();

  if (!session || !session.user || session.user.role !== "DOSEN") {
    redirect("/login?login=unauthorized");
  }

  const dosenName = session.user.name || "Dosen";

  return (
    <div className="p-6 space-y-6">
      <Dashboard initialDosenName={dosenName} />
    </div>
  );
}
