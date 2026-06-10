import { NextRequest, NextResponse } from "next/server";
import {
  EED_TEST_SEARCH_TERMS,
  getTestSearchHint,
  hashCustomerIp,
  isTestEedEnvironment,
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
    testMode: isTestEedEnvironment() && !isMockModeEnabled(),
    allowedSearchTerms: [...EED_TEST_SEARCH_TERMS],
    eedIdConfigured: Boolean(process.env.EED_ID),
    shopUrl,
    ...result,
  });
}
