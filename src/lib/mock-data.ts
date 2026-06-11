import type { NormalizedProduct, NormalizedProductDetail } from "./types";

const MOCK_PRODUCTS: NormalizedProduct[] = [
  {
    id: "6913",
    name: "SCART-KABEL, SCART-STECKER / SCART-STECKER, 21POL, 1,5M",
    price: "2,29 €",
    priceValue: 2.29,
    hasImage: true,
    imageUrl: undefined,
    manufacturer: "",
    category: "Scartstecker/Scartstecker",
    deliveryTime: "lieferbar innerhalb von 3 Tagen",
    available: true,
  },
  {
    id: "5729092",
    name: "1054113034 STRAHLUNGSHEIZKÖRPER 1200 W FÜR GLASKERAMIK",
    price: "19,60 €",
    priceValue: 19.6,
    hasImage: true,
    category: "STRAHLENHEIZKÖRPER",
    deliveryTime: "sofort lieferbar",
    available: true,
  },
  {
    id: "8929903",
    name: "1054113034 481281718738 PLATE,RADIANT 140MM",
    price: "42,93 €",
    priceValue: 42.93,
    hasImage: false,
    manufacturer: "WHIRLPOOL",
    category: "STRAHLENHEIZKÖRPER",
    deliveryTime: "lieferbar innerhalb von 3 Wochen",
    available: true,
  },
  {
    id: "9319433",
    name: "LR3 1,5V PILE ALCALINE MICRO VARTA 4 PCS. BLISTER MAXITECH",
    price: "13,31 €",
    priceValue: 13.31,
    hasImage: true,
    manufacturer: "VARTA",
    category: "PILES STANDARDS AAA/LR03",
    deliveryTime: "disponible immédiatement",
    available: true,
  },
  {
    id: "H833690",
    name: "SONY RM-ED017 ORIGINAL FERNBEDIENUNG",
    price: "24,95 €",
    priceValue: 24.95,
    hasImage: true,
    manufacturer: "SONY",
    category: "Fernbedienungen",
    deliveryTime: "sofort lieferbar",
    available: true,
  },
  {
    id: "G652278",
    name: "HDMI KABEL 2.0 HIGH SPEED 2M",
    price: "8,49 €",
    priceValue: 8.49,
    hasImage: true,
    manufacturer: "—",
    category: "AV-Kabelverbindungen",
    deliveryTime: "sofort lieferbar",
    available: true,
  },
  {
    id: "D127993",
    name: "AEG WASCHMASCHINENPUMPE 132663010",
    price: "34,50 €",
    priceValue: 34.5,
    hasImage: true,
    manufacturer: "AEG",
    category: "Pumpen",
    deliveryTime: "lieferbar innerhalb von 3 Tagen",
    available: true,
  },
];

const MOCK_DETAILS: Record<string, NormalizedProductDetail> = {
  "6913": {
    ...MOCK_PRODUCTS[0],
    weight: "0",
    ean: "8976543210123",
    attributes: { length_in_mm: "1500" },
    categoryPath: [
      { vgruppenid: "2000000000", vgruppenname: "Verbinder/ Kabel/ Stecker/ Adapter" },
      { vgruppenid: "2100000000", vgruppenname: "Audio/Video-Verbindungen" },
      { vgruppenid: "2100365000", vgruppenname: "Scartstecker/Scartstecker" },
    ],
    disposalCost: "0,00 €",
  },
  "5729092": {
    ...MOCK_PRODUCTS[1],
    ean: "8976543210123",
    attributes: { packing_contents: "2" },
    disposalCost: "0,00 €",
  },
  "8929903": {
    ...MOCK_PRODUCTS[2],
    disposalCost: "0,00 €",
  },
  "9319433": {
    ...MOCK_PRODUCTS[3],
    ean: "8976543210123",
    attributes: { packing_contents: "2", disposalcost: "0,00" },
  },
  H833690: {
    ...MOCK_PRODUCTS[4],
    ean: "8976543210123",
    attributes: { type: "Original remote control" },
  },
  G652278: {
    ...MOCK_PRODUCTS[5],
    attributes: { length_in_mm: "2000", version: "HDMI 2.0" },
  },
  D127993: {
    ...MOCK_PRODUCTS[6],
    attributes: { compatible_with: "AEG washing machines" },
  },
};

export function isMockModeEnabled(): boolean {
  return process.env.EED_USE_MOCK === "true";
}

/** When live EED rejects a term, fall back to sample data (default: on). */
export function isMockFallbackEnabled(): boolean {
  return process.env.EED_FALLBACK_MOCK !== "false";
}

export function mockSearchProducts(query: string): {
  products: NormalizedProduct[];
  total: number;
} {
  const q = query.trim().toLowerCase();
  let products = MOCK_PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.manufacturer?.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q),
  );

  if (products.length === 0) {
    products = MOCK_PRODUCTS;
  }

  return { products, total: products.length };
}

export function getMockProductName(articleId: string): string | undefined {
  return (
    MOCK_DETAILS[articleId]?.name ??
    MOCK_PRODUCTS.find((product) => product.id === articleId)?.name
  );
}

export function mockGetProductDetails(articleId: string): NormalizedProductDetail | null {
  if (MOCK_DETAILS[articleId]) return MOCK_DETAILS[articleId];

  const summary = MOCK_PRODUCTS.find((product) => product.id === articleId);
  return summary ?? null;
}
