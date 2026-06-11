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
import { parseEedJson } from "./parse-eed-json";
import { buildEedUrl, DEFAULT_TEST_EED_ID, getEedIdFromEnv, isPublicTestEedId } from "./eed-url";

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
export { DEFAULT_TEST_EED_ID };

export function isTestEedEnvironment(): boolean {
  return isPublicTestEedId(getEedId());
}

function getEedId(): string {
  return getEedIdFromEnv(process.env.EED_ID);
}

async function resolveSessionId(
  options: Omit<EedRequestOptions, "params" | "sessionId"> & { sessionId: string },
): Promise<string> {
  // Test environment: neuesitzung is disabled — always use sessionid=auto (EED docs 7.0.1.1)
  if (isTestEedEnvironment()) {
    return "auto";
  }

  if (options.sessionId && options.sessionId !== "auto") {
    return options.sessionId;
  }

  return createEedSession(options);
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

function isEedSuccess(fehlernummer: string | number | undefined): boolean {
  return String(fehlernummer ?? "") === "0";
}

async function createEedSession(
  options: Omit<EedRequestOptions, "params" | "sessionId">,
): Promise<string> {
  const data = await callEed<{ sessionid: string; fehlernummer: string | number }>({
    ...options,
    sessionId: "",
    params: { art: "neuesitzung" },
  });

  return data.sessionid;
}

async function callEed<T extends { fehlernummer: string | number; fehlermeldung?: string }>(
  options: EedRequestOptions,
): Promise<T & { neuesessionid?: string; sessionid?: string }> {
  const requestParams: Record<string, string> = {
    ...options.params,
    shopurl: options.shopUrl,
    customerip: options.customerIpHash,
  };

  if (options.params.art !== "neuesitzung" && options.sessionId) {
    requestParams.sessionid = options.sessionId;
  }

  const url = buildEedUrl(getEedId(), requestParams);

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
      data = parseEedJson<T & { neuesessionid?: string }>(text);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "EED gateway returned invalid JSON";
      throw new EedApiError(message);
    }

    if (!isEedSuccess(data.fehlernummer)) {
      const message = data.fehlermeldung ?? "Unknown EED API error";
      throw new EedApiError(message, String(data.fehlernummer));
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

  const sessionId = await resolveSessionId(options);

  const data = await callEed<ProductSearchResponse>({
    ...options,
    sessionId,
    params: {
      art: "artikelsuche",
      suchbg: searchTerm,
      anzahl: "10",
      ...(isTestEedEnvironment() ? {} : { bigPicture: "1" }),
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

  const sessionId = await resolveSessionId(options);

  // artikeldetails is restricted to fixed test article IDs on the public credential.
  // artikelsuche + artnr + artikeldetails=1 works for any article from search results.
  const data = await callEed<ProductSearchResponse>({
    ...options,
    sessionId,
    params: {
      art: "artikelsuche",
      artnr: articleId,
      artikeldetails: "1",
      bigPicture: "1",
      attrib: "1",
    },
  });

  const hits = data.treffer ?? {};
  const item = Object.values(hits)[0] as ProductDetailResponse | undefined;

  if (!item) {
    throw new EedApiError(`Product ${articleId} not found`);
  }

  return {
    product: normalizeProductDetail(item),
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

  const sessionId = await resolveSessionId(options);

  const data = await callEed<{ fehlernummer: string; tempurl?: string }>({
    ...options,
    sessionId,
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
    if (isTestEedEnvironment()) {
      const data = await callEed<ProductSearchResponse>({
        ...options,
        sessionId: "auto",
        params: { art: "artikelsuche", suchbg: "SONY", anzahl: "1" },
      });
      return { ok: true, sessionId: data.neuesessionid };
    }

    const data = await callEed<{ fehlernummer: string | number; sessionid?: string }>({
      ...options,
      sessionId: "",
      params: { art: "neuesitzung" },
    });
    return { ok: true, sessionId: data.sessionid };
  } catch (error) {
    const message =
      error instanceof EedApiError ? error.message : "Connection failed";
    return { ok: false, error: message };
  }
}
