export const EED_BASE_URL = "https://shop.euras.com/eed.php";

export const DEFAULT_TEST_EED_ID = "AUDs4BRTdG2KJMGkv9U3hcQZ8NUxLdZytest";

export function getEedIdFromEnv(envId?: string): string {
  const trimmed = envId?.trim();
  return trimmed || DEFAULT_TEST_EED_ID;
}

/** Build EED URL using id= parameter (matches official PHP examples). */
export function buildEedUrl(
  eedId: string,
  params: Record<string, string>,
): string {
  const searchParams = new URLSearchParams({
    format: "json",
    id: eedId,
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
