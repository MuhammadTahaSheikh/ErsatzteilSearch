"use client";

import Image from "next/image";
import Link from "next/link";
import type { NormalizedProductDetail } from "@/lib/types";

interface ProductDetailViewProps {
  product: NormalizedProductDetail;
  searchQuery?: string;
}

function DetailImage({ product }: { product: NormalizedProductDetail }) {
  const src =
    product.imageUrl ?? (product.hasImage ? `/api/images/${product.id}` : null);

  if (!src) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl bg-[var(--surface-elevated)] text-[var(--muted)]">
        <svg className="h-20 w-20 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="animate-scale-in relative aspect-square overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--card-shadow)]">
      <Image
        src={src}
        alt={product.name}
        fill
        className="object-contain p-6"
        sizes="(max-width: 768px) 100vw, 480px"
        priority
        unoptimized
      />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4 border-b border-[var(--border)] py-3 text-sm last:border-0">
      <dt className="text-[var(--muted)]">{label}</dt>
      <dd className="text-right font-medium text-[var(--foreground)]">{value}</dd>
    </div>
  );
}

export function ProductDetailView({ product, searchQuery }: ProductDetailViewProps) {
  const categoryPath = product.categoryPath?.map((g) => g.vgruppenname).join(" › ");
  const backHref = searchQuery
    ? `/?q=${encodeURIComponent(searchQuery)}`
    : "/";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href={backHref}
        className="animate-fade-up mb-8 inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)]/60 px-4 py-2 text-sm font-medium text-[var(--accent)] backdrop-blur-sm transition-all hover:border-[var(--accent)] hover:shadow-[var(--glow-sm)]"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to search
      </Link>

      <div className="grid gap-10 lg:grid-cols-2">
        <DetailImage product={product} />

        <div className="animate-fade-up animate-delay-2">
          {product.category && (
            <p className="mb-2 text-sm font-semibold tracking-wide text-[var(--accent)] uppercase">
              {product.category}
            </p>
          )}
          <h1 className="mb-5 text-2xl leading-tight font-bold text-[var(--foreground)] sm:text-3xl lg:text-4xl">
            {product.name}
          </h1>

          <div className="mb-6 flex flex-wrap items-center gap-3">
            <p className="text-3xl font-bold text-[var(--foreground)]">{product.price}</p>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                product.available
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : "bg-[var(--surface-elevated)] text-[var(--muted)]"
              }`}
            >
              {product.available ? "Available" : "Not available"}
            </span>
          </div>

          {product.deliveryTime && (
            <p className="mb-6 text-sm text-[var(--muted)]">
              Delivery: <span className="font-medium text-[var(--foreground)]">{product.deliveryTime}</span>
            </p>
          )}

          <dl className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/80 px-5 backdrop-blur-sm">
            <InfoRow label="Article no." value={product.id} />
            <InfoRow label="EAN" value={product.ean} />
            <InfoRow label="Manufacturer" value={product.manufacturer} />
            <InfoRow label="Category" value={categoryPath ?? product.category} />
            <InfoRow label="Disposal cost" value={product.disposalCost} />
          </dl>

          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <div className="mt-6">
              <h2 className="mb-3 text-sm font-semibold tracking-wide text-[var(--foreground)] uppercase">
                Specifications
              </h2>
              <dl className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/80 px-5 backdrop-blur-sm">
                {Object.entries(product.attributes).map(([key, value]) => (
                  <InfoRow
                    key={key}
                    label={key.replace(/_/g, " ")}
                    value={value}
                  />
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
