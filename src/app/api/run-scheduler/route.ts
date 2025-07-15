import { NextResponse } from "next/server";
import { scheduleAbsent } from "@/lib/schedule-absent";
// import { scheduleAbsentRange } from "@/lib/schedule-absent";

export async function GET() {
  try {
    await scheduleAbsent();
    // await scheduleAbsentRange("2025-06-30", "2025-07-15");
    return NextResponse.json({ message: "Scheduler dijalankan!" });
  } catch (error) {
    console.error("Scheduler error:", error);
    return NextResponse.json({ error: "Gagal menjalankan scheduler." }, { status: 500 });
  }
}
