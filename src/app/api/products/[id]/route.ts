import { NextRequest, NextResponse } from "next/server";
import {
  EedApiError,
  getProductDetails,
  hashCustomerIp,
  resolveClientIp,
} from "@/lib/eed";
import { resolveShopUrl } from "@/lib/session";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const searchQuery = request.nextUrl.searchParams.get("q")?.trim();
  const baseShopUrl = resolveShopUrl(request);
  const shopUrl = `${baseShopUrl.replace(/\/$/, "")}/product/${encodeURIComponent(id)}`;
  const customerIpHash = hashCustomerIp(
    resolveClientIp(request.headers.get("x-forwarded-for")),
  );

  try {
    const result = await getProductDetails(
      id,
      {
        sessionId: "auto",
        shopUrl,
        customerIpHash,
      },
      searchQuery,
    );

    return NextResponse.json({ product: result.product });
  } catch (error) {
    const message =
      error instanceof EedApiError
        ? error.message
        : "Failed to load product details";

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
