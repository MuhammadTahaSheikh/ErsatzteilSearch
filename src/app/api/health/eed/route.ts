import { NextResponse } from "next/server";
import { isTestEedEnvironment } from "@/lib/eed";
import { isMockModeEnabled } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json({
    mockMode: isMockModeEnabled(),
    testMode: isTestEedEnvironment(),
    testKeywords: isTestEedEnvironment() ? ["SONY", "AEG", "HDMI"] : null,
  });
}
