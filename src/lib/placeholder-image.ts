export function createProductPlaceholderSvg(
  artnr: string,
  label = "Spare Part",
): string {
  const shortLabel =
    label.length > 28 ? `${label.slice(0, 25)}...` : label;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400" role="img" aria-label="${label}">
  <rect width="400" height="400" fill="#f1f5f9"/>
  <rect x="40" y="40" width="320" height="240" rx="16" fill="#e2e8f0"/>
  <circle cx="200" cy="140" r="48" fill="#cbd5e1"/>
  <path d="M88 248h224l-36-48-52 64-40-52z" fill="#94a3b8"/>
  <text x="200" y="320" text-anchor="middle" font-family="system-ui,sans-serif" font-size="14" fill="#64748b">${shortLabel}</text>
  <text x="200" y="348" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" fill="#94a3b8">${artnr}</text>
</svg>`;
}

export function placeholderSvgResponse(artnr: string, label?: string): Response {
  const svg = createProductPlaceholderSvg(artnr, label);
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
