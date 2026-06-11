import { parseEedErrorResponse } from "./eed-url";

/** EED sometimes returns almost-JSON with unquoted numeric keys, e.g. {0:"A"}. */
export function sanitizeEedJson(raw: string): string {
  return raw
    .trim()
    .replace(/^\uFEFF/, "")
    .replace(/([{,]\s*)(\d+)(\s*:)/g, '$1"$2"$3');
}

export function parseEedJson<T>(raw: string): T {
  const text = raw.trim().replace(/^\uFEFF/, "");

  if (!text) {
    throw new Error("EED gateway returned an empty response");
  }

  const plainError = parseEedErrorResponse(text);
  if (plainError) {
    throw new Error(`${plainError.message} (EED ${plainError.code})`);
  }

  if (text.startsWith("<!") || text.startsWith("<html") || text.startsWith("<")) {
    throw new Error("EED gateway returned HTML instead of JSON");
  }

  const candidates = [text, sanitizeEedJson(text)];

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate) as T;
    } catch {
      // try next strategy
    }
  }

  const preview = text.slice(0, 160).replace(/\s+/g, " ");
  throw new Error(`EED gateway returned invalid JSON: ${preview}`);
}
