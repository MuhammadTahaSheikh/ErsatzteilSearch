import { NextRequest, NextResponse } from "next/server";
import { hashCustomerIp, isTestEedEnvironment, resolveClientIp } from "@/lib/eed";
import { EED_BASE_URL, buildEedUrl, getEedIdFromEnv } from "@/lib/eed-url";
import { isMockModeEnabled } from "@/lib/mock-data";
import { resolveShopUrl } from "@/lib/session";

async function probeEed(label: string, eedId: string, params: Record<string, string>) {
  const url = buildEedUrl(eedId, params);
  const response = await fetch(url, { cache: "no-store" });
  const raw = await response.text();
  return { label, eedIdTail: eedId.slice(-12), httpStatus: response.status, raw: raw.slice(0, 500) };
}

function buildManualEedUrl(eedId: string, params: Record<string, string>): string {
  const parts = [
    `format=json`,
    `id=${encodeURIComponent(eedId)}`,
    `art=${encodeURIComponent(params.art)}`,
    `suchbg=${encodeURIComponent(params.suchbg)}`,
    `anzahl=${encodeURIComponent(params.anzahl ?? "10")}`,
    `sessionid=${encodeURIComponent(params.sessionid ?? "auto")}`,
    `shopurl=${encodeURIComponent(params.shopurl)}`,
    `customerip=${encodeURIComponent(params.customerip)}`,
  ];
  return `${EED_BASE_URL}?${parts.join("&")}`;
}

export async function GET(request: NextRequest) {
  const base = {
    mockMode: isMockModeEnabled(),
    testMode: isTestEedEnvironment(),
    shopUrl: resolveShopUrl(request),
    configuredAppUrl: process.env.NEXT_PUBLIC_APP_URL ?? null,
  };

  if (request.nextUrl.searchParams.get("probe") !== "1") {
    return NextResponse.json({
      ...base,
      testKeywords: isTestEedEnvironment() ? ["SONY", "AEG", "HDMI"] : null,
    });
  }

  const eedId = getEedIdFromEnv(process.env.EED_ID);
  const baseId = eedId.replace(/test$/i, "");
  const shopUrl = `${base.shopUrl.replace(/\/$/, "")}/?q=SONY`;
  const customerip = hashCustomerIp(resolveClientIp(request.headers.get("x-forwarded-for")));
  const common = { art: "artikelsuche", suchbg: "SONY", anzahl: "10", sessionid: "auto", shopurl: shopUrl, customerip };

  const variants = await Promise.all([
    probeEed("with-test-suffix", eedId, common),
    probeEed("base-id-no-test-suffix", baseId, common),
    probeEed("no-anzahl", eedId, { art: common.art, suchbg: common.suchbg, sessionid: common.sessionid, shopurl: common.shopurl, customerip: common.customerip }),
    probeEed("artikelsuche_neu-SICHERUNG", eedId, { ...common, art: "artikelsuche_neu", suchbg: "SICHERUNG" }),
  ]);

  const manualUrl = buildManualEedUrl(eedId, common);
  const manualResponse = await fetch(manualUrl, { cache: "no-store" });
  const manualRaw = await manualResponse.text();

  return NextResponse.json({
    ...base,
    variants,
    manual: { httpStatus: manualResponse.status, raw: manualRaw.slice(0, 500) },
  });
}
