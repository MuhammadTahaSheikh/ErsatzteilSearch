export const EED_BASE_URL = "https://shop.euras.com/eed.php";

/** German public test credential from EED docs section 12 (DE, client 599). */
export const DEFAULT_TEST_EED_ID = "AUDs4BRTdG2KJMGkv9U3hcQZ8NUxLdZy";

export function normalizeEedId(eedId: string): string {
  const trimmed = eedId.trim();

  // Docs say append "test" for the test environment, but the suffixed ID rejects
  // artikelsuche even for allowed keywords like SONY. The base credential works.
  if (trimmed.toLowerCase().endsWith("test") && trimmed.length > 4) {
    return trimmed.slice(0, -4);
  }

  return trimmed;
}

export function getEedIdFromEnv(envId?: string): string {
  const trimmed = envId?.trim().replace(/^["']|["']$/g, "");
  return normalizeEedId(trimmed || DEFAULT_TEST_EED_ID);
}

export function isPublicTestEedId(eedId?: string): boolean {
  return normalizeEedId(eedId ?? getEedIdFromEnv(process.env.EED_ID)) === DEFAULT_TEST_EED_ID;
}

/** Build EED URL using id= parameter (matches official PHP examples). */
export function buildEedUrl(
  eedId: string,
  params: Record<string, string>,
): string {
  const searchParams = new URLSearchParams({
    format: "json",
    id: normalizeEedId(eedId),
    ...params,
  });

  return `${EED_BASE_URL}?${searchParams.toString()}`;
}

export function parseEedErrorResponse(raw: string): {
  code: string;
  message: string;
} | null {
  const text = raw.trim();
  if (!text.startsWith("ERROR;")) return null;

  const parts = text.split(";");
  if (parts.length < 3) return null;

  return {
    code: parts[1] ?? "unknown",
    message: parts.slice(2).join(";").trim(),
  };
}
