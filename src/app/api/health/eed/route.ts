import { NextRequest, NextResponse } from "next/server";
import { hashCustomerIp, resolveClientIp } from "@/lib/eed";
import { buildEedUrl, getEedIdFromEnv } from "@/lib/eed-url";
import { isMockModeEnabled } from "@/lib/mock-data";
import { isTestEedEnvironment } from "@/lib/eed";
import { resolveShopUrl } from "@/lib/session";

export async function GET(request: NextRequest) {
  const base = {
    mockMode: isMockModeEnabled(),
    testMode: isTestEedEnvironment(),
    testKeywords: isTestEedEnvironment() ? ["SONY", "AEG", "HDMI"] : null,
    shopUrl: resolveShopUrl(request),
    configuredAppUrl: process.env.NEXT_PUBLIC_APP_URL ?? null,
  };

  if (request.nextUrl.searchParams.get("probe") !== "1") {
    return NextResponse.json(base);
  }

  const eedId = getEedIdFromEnv(process.env.EED_ID);
  const shopUrl = `${base.shopUrl.replace(/\/$/, "")}/?q=SONY`;
  const params = {
    art: "artikelsuche",
    suchbg: "SONY",
    anzahl: "10",
    sessionid: "auto",
    shopurl: shopUrl,
    customerip: hashCustomerIp(resolveClientIp(request.headers.get("x-forwarded-for"))),
  };

  const url = buildEedUrl(eedId, params);
  const response = await fetch(url, { cache: "no-store" });
  const raw = await response.text();

  return NextResponse.json({
    ...base,
    probeParams: params,
    eedIdTail: eedId.slice(-12),
    httpStatus: response.status,
    raw: raw.slice(0, 4000),
  });
}
