import { NextResponse } from "next/server";
import { isTestEedId } from "@/lib/eed-config";
import { isMockModeEnabled } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json({
    mockMode: isMockModeEnabled(),
    testMode: isTestEedId(),
    testKeywords: isTestEedId() ? ["SONY", "AEG", "HDMI"] : null,
  });
}
