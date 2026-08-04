import { NextRequest, NextResponse } from "next/server";
import { autoGenerateAndPublish } from "@/lib/auto-blogger";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("\n⏰ CRON JOB: Auto Blogger\n");

    const result = await autoGenerateAndPublish();

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
