import { NextResponse } from "next/server";
import { scheduleAbsent } from "@/lib/schedule-absent";

export async function GET() {
  try {
    await scheduleAbsent();
    return NextResponse.json({ message: "Scheduler dijalankan!" });
  } catch (error) {
    console.error("Scheduler error:", error);
    return NextResponse.json({ error: "Gagal menjalankan scheduler." }, { status: 500 });
  }
}
