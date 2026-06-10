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
      <div className="flex h-full w-full items-center justify-center bg-slate-800/40 text-slate-600">
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
      <div className="relative aspect-square overflow-hidden bg-slate-900/30">
        <ProductImage product={product} />
        {!product.available && (
          <span className="absolute top-3 left-3 rounded-lg bg-slate-900/80 px-2.5 py-1 text-xs font-semibold text-slate-300 backdrop-blur-sm">
            Unavailable
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        {product.category && (
          <p className="text-xs font-semibold tracking-widest text-orange-400 uppercase">
            {product.category}
          </p>
        )}
        <h3
          className="line-clamp-2 text-sm leading-snug font-semibold text-white transition-colors group-hover:text-orange-300"
          style={{ fontFamily: "var(--font-outfit), sans-serif" }}
        >
          {product.name}
        </h3>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <p
            className="text-xl font-bold text-white"
            style={{ fontFamily: "var(--font-outfit), sans-serif" }}
          >
            {product.price}
          </p>
          {product.deliveryTime && (
            <p className="text-right text-xs text-slate-500">{product.deliveryTime}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
