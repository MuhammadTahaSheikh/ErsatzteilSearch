"use client";

import Image from "next/image";
import Link from "next/link";
import type { NormalizedProduct } from "@/lib/types";

interface ProductCardProps {
  product: NormalizedProduct;
  searchQuery?: string;
}

function ProductImage({ product }: { product: NormalizedProduct }) {
  const src =
    product.imageUrl ?? (product.hasImage ? `/api/images/${product.id}` : null);

  if (!src) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[var(--surface-elevated)] text-[var(--muted)]">
        <svg className="h-12 w-12 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
    <Image
      src={src}
      alt={product.name}
      fill
      className="object-contain p-3 transition-transform duration-500 group-hover:scale-105"
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
      unoptimized
    />
  );
}

export function ProductCard({ product, searchQuery }: ProductCardProps) {
  const href = searchQuery
    ? `/product/${encodeURIComponent(product.id)}?q=${encodeURIComponent(searchQuery)}`
    : `/product/${encodeURIComponent(product.id)}`;

  return (
    <Link
      href={href}
      className="product-card group flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]/90 shadow-[var(--card-shadow)] backdrop-blur-sm hover:border-[var(--accent)]/40"
    >
      <div className="relative aspect-square overflow-hidden bg-[var(--surface-elevated)]">
        <ProductImage product={product} />
        {!product.available && (
          <span className="absolute top-3 left-3 rounded-lg bg-black/70 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
            Unavailable
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[var(--surface)]/80 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        {product.category && (
          <p className="text-xs font-semibold tracking-wide text-[var(--accent)] uppercase">
            {product.category}
          </p>
        )}
        <h3 className="line-clamp-2 text-sm leading-snug font-semibold text-[var(--foreground)] transition-colors group-hover:text-[var(--accent)]">
          {product.name}
        </h3>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <p className="text-lg font-bold text-[var(--foreground)]">{product.price}</p>
          {product.deliveryTime && (
            <p className="text-right text-xs text-[var(--muted)]">{product.deliveryTime}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
