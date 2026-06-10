import { NextRequest, NextResponse } from "next/server";
import {
  EedApiError,
  hashCustomerIp,
  resolveClientIp,
  searchProducts,
} from "@/lib/eed";
import { getSessionId, resolveShopUrl } from "@/lib/session";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json({ products: [], total: 0 });
  }

  const sessionId = (await getSessionId()) ?? "auto";
  const shopUrl = resolveShopUrl(request);
  const customerIpHash = hashCustomerIp(
    resolveClientIp(request.headers.get("x-forwarded-for")),
  );

  try {
    const result = await searchProducts(query, {
      sessionId,
      shopUrl,
      customerIpHash,
    });

    const response = NextResponse.json({
      products: result.products,
      total: result.total,
      ...(result.mock ? { mock: true } : {}),
      ...(result.hint ? { hint: result.hint } : {}),
    });

    if (result.sessionId) {
      response.cookies.set("eed_session_id", result.sessionId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 3,
        path: "/",
      });
    }

    return response;
  } catch (error) {
    const message =
      error instanceof EedApiError
        ? error.message
        : "Failed to search products";

    const isTestHint =
      message.includes("Test API only supports") ||
      message.includes("Test mode only possible");

    return NextResponse.json(
      {
        error: isTestHint ? undefined : message,
        hint: isTestHint
          ? "Test API only supports: SONY, AEG, HDMI — click a button below"
          : undefined,
        products: [],
        total: 0,
      },
      { status: isTestHint ? 200 : 502 },
    );
  }
}
