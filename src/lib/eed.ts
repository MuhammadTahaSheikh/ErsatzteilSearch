import { createHash } from "crypto";
import {
  isMockFallbackEnabled,
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

function isTestModeSearchRestriction(error: unknown): boolean {
  if (!(error instanceof EedApiError)) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes("test mode only possible") ||
    message.includes("testumgebung") ||
    message.includes("test api only supports") ||
    message.includes("testaccount only") ||
    message.includes("search keywords are allowed")
  );
}

async function executeLiveSearch(
  searchTerm: string,
  options: Omit<EedRequestOptions, "params">,
): Promise<ProductSearchResponse & { neuesessionid?: string }> {
  const sessionId = await resolveSessionId(options);
  const strategies = ["artikelsuche", "artikelsuche_neu"] as const;
  let lastError: EedApiError | null = null;

  for (const art of strategies) {
    try {
      return await callEed<ProductSearchResponse>({
        ...options,
        sessionId,
        params: {
          art,
          suchbg: searchTerm,
          anzahl: "10",
          ...(isTestEedEnvironment() ? {} : { bigPicture: "1" }),
        },
      });
    } catch (error) {
      if (isTestModeSearchRestriction(error)) {
        lastError = error as EedApiError;
        continue;
      }
      throw error;
    }
  }

  throw lastError ?? new EedApiError("Search failed");
}

export async function searchProducts(
  query: string,
  options: Omit<EedRequestOptions, "params">,
): Promise<{
  products: NormalizedProduct[];
  total: number;
  sessionId?: string;
  mock?: boolean;
  mockFallback?: boolean;
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

  try {
    const data = await executeLiveSearch(searchTerm, options);
    const hits = data.treffer ?? {};
    const products = Object.values(hits).map(normalizeProduct);

    if (products.length === 0 && isMockFallbackEnabled() && isTestEedEnvironment()) {
      const result = mockSearchProducts(trimmed);
      return { ...result, mock: true, mockFallback: true };
    }

    return {
      products,
      total: Number(data.gesamtanzahltreffer ?? products.length),
      sessionId: data.neuesessionid,
    };
  } catch (error) {
    if (!isMockFallbackEnabled() || !isTestModeSearchRestriction(error)) {
      throw error;
    }

    const result = mockSearchProducts(trimmed);
    return { ...result, mock: true, mockFallback: true };
  }
}

export async function getProductDetails(
  articleId: string,
  options: Omit<EedRequestOptions, "params">,
  searchQuery?: string,
): Promise<{
  product: NormalizedProductDetail;
  sessionId?: string;
  mock?: boolean;
  mockFallback?: boolean;
}> {
  if (isMockModeEnabled()) {
    const product = mockGetProductDetails(articleId);
    if (!product) {
      throw new EedApiError(`Product ${articleId} not found`);
    }
    return { product, mock: true };
  }

  // Public test API blocks direct artnr lookups except fixed IDs.
  // Re-use the search results when we know the query the user searched for.
  if (searchQuery?.trim()) {
    const { products } = await searchProducts(searchQuery.trim(), options);
    const found = products.find((product) => product.id === articleId);
    if (found) {
      return { product: found };
    }
  }

  if (isMockFallbackEnabled()) {
    const product = mockGetProductDetails(articleId);
    if (product) {
      return { product, mock: true, mockFallback: true };
    }
  }

  const sessionId = await resolveSessionId(options);

  try {
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

    if (item) {
      return {
        product: normalizeProductDetail(item),
        sessionId: data.neuesessionid,
      };
    }
  } catch {
    // fall through to not found
  }

  throw new EedApiError(`Product ${articleId} not found`);
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
