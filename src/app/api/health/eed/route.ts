import { NextResponse } from "next/server";
import { isTestEedEnvironment } from "@/lib/eed";
import { getEedIdFromEnv } from "@/lib/eed-url";
import { isMockModeEnabled } from "@/lib/mock-data";
import { resolveShopUrl } from "@/lib/session";

export async function GET() {
  return NextResponse.json({
    mockMode: isMockModeEnabled(),
    testMode: isTestEedEnvironment(),
    eedIdConfigured: Boolean(process.env.EED_ID),
    eedIdTail: getEedIdFromEnv(process.env.EED_ID).slice(-8),
  });
}
