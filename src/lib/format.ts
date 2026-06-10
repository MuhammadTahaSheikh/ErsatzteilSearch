export function parseGermanPrice(price: string | undefined): number {
  if (!price) return 0;
  const normalized = price.replace(/\./g, "").replace(",", ".");
  const value = parseFloat(normalized);
  return Number.isFinite(value) ? value : 0;
}

export function formatPrice(price: string | undefined): string {
  const value = parseGermanPrice(price);
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export function isAvailable(bestellbar: string | undefined): boolean {
  return bestellbar === "J";
}

export function hasImage(bild: string | undefined): boolean {
  return bild === "J";
}
