import { NextRequest, NextResponse } from "next/server";
import {
  EedApiError,
  getProductImageUrl,
  hashCustomerIp,
  resolveClientIp,
} from "@/lib/eed";
import { getMockProductName, isMockModeEnabled } from "@/lib/mock-data";
import { placeholderSvgResponse } from "@/lib/placeholder-image";
import { getSessionId, resolveShopUrl } from "@/lib/session";

interface RouteContext {
  params: Promise<{ artnr: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { artnr } = await context.params;

  if (isMockModeEnabled()) {
    const label = getMockProductName(artnr) ?? "Spare Part";
    return placeholderSvgResponse(artnr, label);
  }

  const sessionId = (await getSessionId()) ?? "auto";
  const shopUrl = resolveShopUrl(request);
  const customerIpHash = hashCustomerIp(
    resolveClientIp(request.headers.get("x-forwarded-for")),
  );

  try {
    const imageUrl = await getProductImageUrl(artnr, {
      sessionId,
      shopUrl,
      customerIpHash,
    });

    if (!imageUrl) {
      return new NextResponse(null, { status: 404 });
    }

    const imageResponse = await fetch(imageUrl, { cache: "no-store" });
    if (!imageResponse.ok) {
      return new NextResponse(null, { status: 404 });
    }

    const buffer = await imageResponse.arrayBuffer();
    const contentType =
      imageResponse.headers.get("content-type") ?? "image/jpeg";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    const message =
      error instanceof EedApiError ? error.message : "Image not available";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
