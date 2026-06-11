import { NextRequest, NextResponse } from "next/server";
import { buildEedUrl, getEedIdFromEnv } from "@/lib/eed-url";
import { hashCustomerIp, resolveClientIp } from "@/lib/eed";

export async function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.get("probe") !== "1") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const eedId = getEedIdFromEnv(process.env.EED_ID);
  const shopUrl = "https://ersatzteil-search.vercel.app/product/R423020";
  const customerip = hashCustomerIp(resolveClientIp(request.headers.get("x-forwarded-for")));
  const base = { art: "artikelsuche", artnr: "R423020", sessionid: "auto", shopurl: shopUrl, customerip };

  const variants = [
    { label: "artnr-only", params: base },
    { label: "artnr-bigPicture", params: { ...base, bigPicture: "1" } },
    { label: "artnr-artikeldetails", params: { ...base, artikeldetails: "1", bigPicture: "1" } },
  ];

  const results = await Promise.all(
    variants.map(async ({ label, params }) => {
      const url = buildEedUrl(eedId, params);
      const response = await fetch(url, { cache: "no-store" });
      const raw = await response.text();
      return { label, raw: raw.slice(0, 400) };
    }),
  );

  return NextResponse.json({ results });
}
