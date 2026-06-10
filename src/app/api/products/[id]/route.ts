import { NextRequest, NextResponse } from "next/server";
import {
  EedApiError,
  getProductDetails,
  hashCustomerIp,
  resolveClientIp,
} from "@/lib/eed";
import { getSessionId, resolveShopUrl } from "@/lib/session";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const sessionId = (await getSessionId()) ?? "auto";
  const shopUrl = resolveShopUrl(request);
  const customerIpHash = hashCustomerIp(
    resolveClientIp(request.headers.get("x-forwarded-for")),
  );

  try {
    const result = await getProductDetails(id, {
      sessionId,
      shopUrl,
      customerIpHash,
    });

    const response = NextResponse.json({ product: result.product });

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
        : "Failed to load product details";

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
