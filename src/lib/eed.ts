import { createHash } from "crypto";
import type {
  NormalizedProduct,
  NormalizedProductDetail,
  ProductDetailResponse,
  ProductSearchResponse,
  ProductSummary,
} from "./types";
import {
  formatPrice,
  hasImage,
  isAvailable,
  parseGermanPrice,
} from "./format";

const EED_BASE_URL = "https://shop.euras.com/eed.php";
const REQUEST_TIMEOUT_MS = 30_000;

export class EedApiError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "EedApiError";
  }
}

interface EedRequestOptions {
  sessionId: string;
  shopUrl: string;
  customerIpHash: string;
  params: Record<string, string>;
}

function getEedId(): string {
  const id = process.env.EED_ID;
  if (!id) {
    throw new EedApiError("EED_ID environment variable is not configured");
  }
  return id;
}

function buildEedUrl({ params }: Pick<EedRequestOptions, "params">): string {
  const searchParams = new URLSearchParams({
    format: "json",
    ...params,
  });

  return `${EED_BASE_URL}?${getEedId()}&${searchParams.toString()}`;
}

async function callEed<T extends { fehlernummer: string; fehlermeldung?: string }>(
  options: EedRequestOptions,
): Promise<T & { neuesessionid?: string }> {
  const url = buildEedUrl({
    params: {
      ...options.params,
      sessionid: options.sessionId,
      shopurl: options.shopUrl,
      customerip: options.customerIpHash,
    },
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      throw new EedApiError(`EED gateway returned HTTP ${response.status}`);
    }

    const data = (await response.json()) as T & { neuesessionid?: string };

    if (data.fehlernummer !== "0") {
      throw new EedApiError(
        data.fehlermeldung ?? "Unknown EED API error",
        data.fehlernummer,
      );
    }

    return data;
  } catch (error) {
    if (error instanceof EedApiError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new EedApiError("EED gateway request timed out");
    }
    throw new EedApiError("Unable to reach the EED gateway");
  } finally {
    clearTimeout(timeout);
  }
}

export function hashCustomerIp(ip: string): string {
  return createHash("md5").update(ip).digest("hex");
}

export function resolveClientIp(forwardedFor: string | null): string {
  if (!forwardedFor) return "127.0.0.1";
  return forwardedFor.split(",")[0]?.trim() || "127.0.0.1";
}

function normalizeProduct(item: ProductSummary): NormalizedProduct {
  return {
    id: item.artikelnummer,
    name: item.artikelbezeichnung,
    price: formatPrice(item.ekpreis),
    priceValue: parseGermanPrice(item.ekpreis),
    imageUrl: item.thumbnailurl,
    hasImage: hasImage(item.bild),
    manufacturer: item.artikelhersteller || undefined,
    category: item.vgruppenname,
    deliveryTime: item.lieferzeit,
    available: isAvailable(item.bestellbar),
  };
}

function normalizeProductDetail(
  item: ProductDetailResponse,
): NormalizedProductDetail {
  const base = normalizeProduct(item);

  return {
    ...base,
    weight: item.gewicht,
    ean: item.EAN,
    attributes: item.artikeldaten,
    categoryPath: item.vgruppenbaum,
    disposalCost: item.disposalcost
      ? formatPrice(item.disposalcost)
      : undefined,
    manufacturerAddress: item.herstelleradresse?.hersteller,
    importerAddress: item.herstelleradresse?.importeur,
  };
}

export async function searchProducts(
  query: string,
  options: Omit<EedRequestOptions, "params">,
): Promise<{
  products: NormalizedProduct[];
  total: number;
  sessionId?: string;
}> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return { products: [], total: 0 };
  }

  const data = await callEed<ProductSearchResponse>({
    ...options,
    params: {
      art: "artikelsuche",
      suchbg: trimmed,
      anzahl: "25",
      bigPicture: "1",
    },
  });

  const hits = data.treffer ?? {};
  const products = Object.values(hits).map(normalizeProduct);

  return {
    products,
    total: Number(data.gesamtanzahltreffer ?? products.length),
    sessionId: data.neuesessionid,
  };
}

export async function getProductDetails(
  articleId: string,
  options: Omit<EedRequestOptions, "params">,
): Promise<{
  product: NormalizedProductDetail;
  sessionId?: string;
}> {
  const data = await callEed<ProductDetailResponse>({
    ...options,
    params: {
      art: "artikeldetails",
      artnr: articleId,
      bigPicture: "1",
      attrib: "1",
    },
  });

  return {
    product: normalizeProductDetail(data),
    sessionId: data.neuesessionid,
  };
}

export async function getProductImageUrl(
  articleId: string,
  options: Omit<EedRequestOptions, "params">,
): Promise<string | null> {
  const data = await callEed<{ fehlernummer: string; tempurl?: string }>({
    ...options,
    params: {
      art: "bild",
      artnr: articleId,
    },
  });

  return data.tempurl ?? null;
}
