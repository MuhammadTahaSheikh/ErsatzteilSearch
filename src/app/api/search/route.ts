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

    return NextResponse.json(
      { error: message, products: [], total: 0 },
      { status: 502 },
    );
  }
}
