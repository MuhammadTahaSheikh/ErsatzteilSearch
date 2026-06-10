import { NextRequest, NextResponse } from "next/server";
import {
  hashCustomerIp,
  resolveClientIp,
  testEedConnection,
} from "@/lib/eed";
import { isMockModeEnabled } from "@/lib/mock-data";
import { resolveShopUrl } from "@/lib/session";

export async function GET(request: NextRequest) {
  const shopUrl = resolveShopUrl(request);
  const customerIpHash = hashCustomerIp(
    resolveClientIp(request.headers.get("x-forwarded-for")),
  );

  const result = await testEedConnection({
    sessionId: "auto",
    shopUrl,
    customerIpHash,
  });

  return NextResponse.json({
    mockMode: isMockModeEnabled(),
    eedIdConfigured: Boolean(process.env.EED_ID),
    shopUrl,
    ...result,
  });
}
