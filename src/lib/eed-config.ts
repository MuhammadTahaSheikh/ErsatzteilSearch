export const EED_TEST_SEARCH_KEYWORDS = ["SONY", "AEG", "HDMI"] as const;

export function isTestEedId(eedId?: string): boolean {
  const id = eedId ?? process.env.EED_ID ?? "";
  return id.toLowerCase().endsWith("test");
}

export function normalizeTestSearchQuery(query: string): string {
  return query.trim().toUpperCase();
}

export function isAllowedTestSearchQuery(query: string): boolean {
  const normalized = normalizeTestSearchQuery(query);
  return (EED_TEST_SEARCH_KEYWORDS as readonly string[]).includes(normalized);
}

export function getTestSearchHint(): string {
  return `EED test API only supports: ${EED_TEST_SEARCH_KEYWORDS.join(", ")}`;
}
