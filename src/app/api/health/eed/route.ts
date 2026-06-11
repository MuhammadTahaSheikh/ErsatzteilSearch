import { NextRequest, NextResponse } from "next/server";
import { isTestEedEnvironment } from "@/lib/eed";
import { isMockModeEnabled } from "@/lib/mock-data";
import { resolveShopUrl } from "@/lib/session";

export async function GET(request: NextRequest) {
  return NextResponse.json({
    mockMode: isMockModeEnabled(),
    testMode: isTestEedEnvironment(),
    testKeywords: isTestEedEnvironment() ? ["SONY", "AEG", "HDMI"] : null,
    shopUrl: resolveShopUrl(request),
    configuredAppUrl: process.env.NEXT_PUBLIC_APP_URL ?? null,
  });
}
