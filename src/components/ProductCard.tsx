"use client";

import Image from "next/image";
import Link from "next/link";
import type { NormalizedProduct } from "@/lib/types";

interface ProductCardProps {
  product: NormalizedProduct;
  index?: number;
}

function ProductImage({ product }: { product: NormalizedProduct }) {
  const src =
    product.imageUrl ?? (product.hasImage ? `/api/images/${product.id}` : null);

  if (!src) {
    return (
      <div className="text-subtle flex h-full w-full items-center justify-center bg-[var(--card-image-bg)]">
        <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      className="object-contain p-4 transition-transform duration-500 group-hover:scale-110"
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
      unoptimized
    />
  );
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const delay = Math.min(index * 0.06, 0.48);

  return (
    <Link
      href={`/product/${encodeURIComponent(product.id)}`}
      className="group glass-card card-shine flex flex-col overflow-hidden rounded-2xl"
      style={{
        animation: `fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s forwards`,
        opacity: 0,
      }}
    >
      <div className="relative aspect-square overflow-hidden bg-[var(--card-image-bg)]">
        <ProductImage product={product} />
        {!product.available && (
          <span className="text-body absolute top-3 left-3 rounded-lg bg-[var(--heading)]/80 px-2.5 py-1 text-xs font-semibold text-[var(--background)] backdrop-blur-sm">
            Unavailable
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        {product.category && (
          <p className="text-accent text-xs font-semibold tracking-widest uppercase">
            {product.category}
          </p>
        )}
        <h3
          className="text-heading line-clamp-2 text-sm leading-snug font-semibold transition-colors group-hover:text-orange-600"
          style={{ fontFamily: "var(--font-outfit), sans-serif" }}
        >
          {product.name}
        </h3>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <p
            className="text-heading text-xl font-bold"
            style={{ fontFamily: "var(--font-outfit), sans-serif" }}
          >
            {product.price}
          </p>
          {product.deliveryTime && (
            <p className="text-subtle text-right text-xs">{product.deliveryTime}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
