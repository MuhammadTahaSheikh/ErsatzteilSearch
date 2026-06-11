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
      <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
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
      className="object-contain p-3"
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
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md"
    >
      <div className="relative aspect-square bg-white">
        <ProductImage product={product} />
        {!product.available && (
          <span className="absolute top-2 left-2 rounded-md bg-slate-800/80 px-2 py-0.5 text-xs font-medium text-white">
            Unavailable
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        {product.category && (
          <p className="text-xs font-medium tracking-wide text-orange-600 uppercase">
            {product.category}
          </p>
        )}
        <h3 className="line-clamp-2 text-sm leading-snug font-semibold text-slate-900 group-hover:text-orange-700">
          {product.name}
        </h3>
        <div className="mt-auto flex items-end justify-between gap-2">
          <p className="text-lg font-bold text-slate-900">{product.price}</p>
          {product.deliveryTime && (
            <p className="text-right text-xs text-slate-500">{product.deliveryTime}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
