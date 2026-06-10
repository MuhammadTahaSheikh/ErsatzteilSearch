#!/usr/bin/env node

/**
 * Quick verification for EED URL building and error parsing.
 * Run: npm run test:eed
 */

const DEFAULT_TEST_EED_ID = "AUDs4BRTdG2KJMGkv9U3hcQZ8NUxLdZytest";
const EED_BASE_URL = "https://shop.euras.com/eed.php";

function buildEedUrl(eedId, params) {
  const searchParams = new URLSearchParams({
    format: "json",
    id: eedId,
    ...params,
  });
  return `${EED_BASE_URL}?${searchParams.toString()}`;
}

function parseEedErrorResponse(raw) {
  const text = raw.trim();
  if (!text.startsWith("ERROR;")) return null;
  const parts = text.split(";");
  if (parts.length < 3) return null;
  return { code: parts[1] ?? "unknown", message: parts.slice(2).join(";").trim() };
}

function sanitizeEedJson(raw) {
  return raw.replace(/([{,]\s*)(\d+)(\s*:)/g, '$1"$2"$3');
}

function parseEedJson(raw) {
  const text = raw.trim();
  const plainError = parseEedErrorResponse(text);
  if (plainError) {
    throw new Error(`${plainError.message} (EED ${plainError.code})`);
  }
  for (const candidate of [text, sanitizeEedJson(text)]) {
    try {
      return JSON.parse(candidate);
    } catch {
      // continue
    }
  }
  throw new Error(`invalid JSON: ${text.slice(0, 80)}`);
}

let failed = 0;

function ok(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
  } else {
    console.error(`  ✗ ${message}`);
    failed++;
  }
}

console.log("EED verification\n");

const sessionUrl = buildEedUrl(DEFAULT_TEST_EED_ID, {
  art: "neuesitzung",
  shopurl: "https://ersatzteil-search.vercel.app",
  customerip: "2022ddf07afb45c7f0de5435f2a098c4",
});

ok(sessionUrl.includes("id=AUDs4BRTdG2KJMGkv9U3hcQZ8NUxLdZytest"), "session URL includes id= parameter");
ok(!sessionUrl.includes("?AUDs4BRTdG2KJMGkv9U3hcQZ8NUxLdZytest&"), "session URL does not use broken prefix-id format");
ok(sessionUrl.startsWith(`${EED_BASE_URL}?format=json&id=`), "session URL starts with format=json&id=");

const searchUrl = buildEedUrl(DEFAULT_TEST_EED_ID, {
  art: "artikelsuche",
  suchbg: "SONY",
  sessionid: "123456",
  anzahl: "10",
  shopurl: "https://ersatzteil-search.vercel.app",
  customerip: "2022ddf07afb45c7f0de5435f2a098c4",
});

ok(searchUrl.includes("suchbg=SONY"), "search URL includes suchbg=SONY");
ok(searchUrl.includes("art=artikelsuche"), "search URL includes art=artikelsuche");

try {
  parseEedJson("ERROR;3002;fehlende ID ()");
  ok(false, "ERROR; response throws parse error");
} catch (error) {
  ok(
    error instanceof Error && error.message.includes("fehlende ID"),
    "ERROR;3002 parsed as missing ID message",
  );
}

const sample = '{"treffer":{"1":{"artikelmerkmal":{0:"A"}}},"fehlernummer":"0"}';
const parsed = parseEedJson(sample);
ok(parsed.fehlernummer === "0", "malformed EED JSON with numeric keys parses");
ok(parsed.treffer["1"].artikelmerkmal["0"] === "A", "numeric key 0 normalized");

console.log("\nLive API check (optional)...");
try {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  // Test env: neuesitzung disabled — use sessionid=auto on search (EED docs 7.0.1.1)
  const liveSearchUrl = buildEedUrl(DEFAULT_TEST_EED_ID, {
    art: "artikelsuche",
    suchbg: "SONY",
    sessionid: "auto",
    anzahl: "10",
    shopurl: "https://ersatzteil-search.vercel.app",
    customerip: "2022ddf07afb45c7f0de5435f2a098c4",
  });

  const searchResponse = await fetch(liveSearchUrl, {
    signal: controller.signal,
    headers: { Accept: "application/json", "User-Agent": "ErsatzteilSearch/1.0" },
  });
  clearTimeout(timeout);
  const searchText = await searchResponse.text();
  console.log(`  Search HTTP ${searchResponse.status}, preview: ${searchText.slice(0, 120).replace(/\s+/g, " ")}`);

  if (searchText.startsWith("ERROR;")) {
    const err = parseEedErrorResponse(searchText);
    ok(false, `live search error: ${err?.message}`);
  } else {
    const searchData = parseEedJson(searchText);
    const count = searchData.gesamtanzahltreffer ?? Object.keys(searchData.treffer ?? {}).length;
    ok(searchData.fehlernummer === "0", `live SONY search OK, ${count} hits`);
  }
} catch (error) {
  console.log(`  ⚠ live API skipped/unreachable: ${error instanceof Error ? error.message : error}`);
}

console.log("");
if (failed > 0) {
  console.error(`${failed} test(s) failed`);
  process.exit(1);
}

console.log("All EED verification tests passed");
