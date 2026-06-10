import { createHash } from "crypto";
import {
  isMockModeEnabled,
  mockGetProductDetails,
  mockSearchProducts,
} from "./mock-data";
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
    public readonly cause?: unknown,
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

/** Public test credential from EED docs section 12 (DE test account). */
const DEFAULT_TEST_EED_ID = "AUDs4BRTdG2KJMGkv9U3hcQZ8NUxLdZytest";

/** Allowed search terms when using the EED test environment. */
export const EED_TEST_SEARCH_TERMS = ["SONY", "AEG", "HDMI"] as const;

export function isTestEedEnvironment(): boolean {
  return getEedId().endsWith("test");
}

export function isAllowedTestSearchTerm(query: string): boolean {
  const normalized = query.trim().toUpperCase();
  return EED_TEST_SEARCH_TERMS.some((term) => term === normalized);
}

export function getTestSearchHint(): string {
  return `Test API only supports: ${EED_TEST_SEARCH_TERMS.join(", ")}`;
}

function getEedId(): string {
  return process.env.EED_ID?.trim() || DEFAULT_TEST_EED_ID;
}

function buildEedUrl({ params }: Pick<EedRequestOptions, "params">): string {
  const searchParams = new URLSearchParams({
    format: "json",
    id: getEedId(),
    ...params,
  });

  return `${EED_BASE_URL}?${searchParams.toString()}`;
}

function describeFetchError(error: unknown): string {
  if (error instanceof Error) {
    if (error.name === "AbortError") {
      return "EED gateway request timed out after 30s";
    }
    if (error.message.includes("fetch failed")) {
      return "Cannot connect to shop.euras.com — check your network or try deploying to Vercel";
    }
    return error.message;
  }
  return "Unknown network error";
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
      headers: {
        Accept: "application/json",
        "User-Agent": "ErsatzteilSearch/1.0",
      },
    });

    if (!response.ok) {
      throw new EedApiError(`EED gateway returned HTTP ${response.status}`);
    }

    const text = await response.text();
    let data: T & { neuesessionid?: string };

    try {
      data = JSON.parse(text) as T & { neuesessionid?: string };
    } catch {
      throw new EedApiError("EED gateway returned invalid JSON");
    }

    if (data.fehlernummer !== "0") {
      const message = data.fehlermeldung ?? "Unknown EED API error";
      if (message.includes("Test mode only possible")) {
        throw new EedApiError(getTestSearchHint(), data.fehlernummer);
      }
      throw new EedApiError(message, data.fehlernummer);
    }

    return data;
  } catch (error) {
    if (error instanceof EedApiError) throw error;

    const detail = describeFetchError(error);
    throw new EedApiError(`Unable to reach the EED gateway: ${detail}`, undefined, error);
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
  mock?: boolean;
  hint?: string;
}> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return { products: [], total: 0 };
  }

  if (isMockModeEnabled()) {
    const result = mockSearchProducts(trimmed);
    return { ...result, mock: true };
  }

  const searchTerm = trimmed.toUpperCase();

  if (isTestEedEnvironment() && !isAllowedTestSearchTerm(searchTerm)) {
    return { products: [], total: 0, hint: getTestSearchHint() };
  }

  const data = await callEed<ProductSearchResponse>({
    ...options,
    params: {
      art: "artikelsuche",
      suchbg: searchTerm,
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
  mock?: boolean;
}> {
  if (isMockModeEnabled()) {
    const product = mockGetProductDetails(articleId);
    if (!product) {
      throw new EedApiError(`Product ${articleId} not found`);
    }
    return { product, mock: true };
  }

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
  if (isMockModeEnabled()) {
    return null;
  }

  const data = await callEed<{ fehlernummer: string; tempurl?: string }>({
    ...options,
    params: {
      art: "bild",
      artnr: articleId,
    },
  });

  return data.tempurl ?? null;
}

export async function testEedConnection(
  options: Omit<EedRequestOptions, "params">,
): Promise<{ ok: true; sessionId?: string } | { ok: false; error: string }> {
  if (isMockModeEnabled()) {
    return { ok: true };
  }

  try {
    const data = await callEed<{ fehlernummer: string; neuesessionid?: string }>({
      ...options,
      params: { art: "neuesitzung" },
    });
    return { ok: true, sessionId: data.neuesessionid };
  } catch (error) {
    const message =
      error instanceof EedApiError ? error.message : "Connection failed";
    return { ok: false, error: message };
  }
}
