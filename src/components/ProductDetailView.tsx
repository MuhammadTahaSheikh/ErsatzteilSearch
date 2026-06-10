"use client";

import Image from "next/image";
import Link from "next/link";
import type { NormalizedProductDetail } from "@/lib/types";

interface ProductDetailViewProps {
  product: NormalizedProductDetail;
}

function DetailImage({ product }: { product: NormalizedProductDetail }) {
  const src =
    product.imageUrl ?? (product.hasImage ? `/api/images/${product.id}` : null);

  if (!src) {
    return (
      <div className="glass flex aspect-square items-center justify-center rounded-2xl text-slate-600">
        <svg className="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
    <div className="glass group relative aspect-square overflow-hidden rounded-2xl">
      <Image
        src={src}
        alt={product.name}
        fill
        className="object-contain p-8 transition-transform duration-700 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, 480px"
        priority
        unoptimized
      />
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5" />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4 border-b border-white/5 py-3.5 text-sm last:border-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-200">{value}</dd>
    </div>
  );
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const categoryPath = product.categoryPath?.map((g) => g.vgruppenname).join(" › ");

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <Link
        href="/"
        className="animate-fade-up mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition-all hover:border-orange-500/40 hover:bg-orange-500/10 hover:text-orange-300"
      >
        <svg className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to search
      </Link>

      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="animate-fade-up" style={{ animationDelay: "0.1s", opacity: 0 }}>
          <DetailImage product={product} />
        </div>

        <div
          className="animate-fade-up"
          style={{ animationDelay: "0.2s", opacity: 0 }}
        >
          {product.category && (
            <p className="mb-3 text-xs font-semibold tracking-widest text-orange-400 uppercase">
              {product.category}
            </p>
          )}
          <h1
            className="mb-5 text-3xl leading-tight font-bold text-white sm:text-4xl"
            style={{ fontFamily: "var(--font-outfit), sans-serif" }}
          >
            {product.name}
          </h1>

          <div className="mb-8 flex flex-wrap items-center gap-4">
            <p
              className="text-4xl font-bold text-white"
              style={{ fontFamily: "var(--font-outfit), sans-serif" }}
            >
              {product.price}
            </p>
            <span
              className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
                product.available
                  ? "border border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
                  : "border border-slate-500/30 bg-slate-500/15 text-slate-400"
              }`}
            >
              {product.available ? "Available" : "Not available"}
            </span>
          </div>

          {product.deliveryTime && (
            <p className="mb-8 flex items-center gap-2 text-sm text-slate-400">
              <svg className="h-4 w-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Delivery: <span className="font-medium text-slate-300">{product.deliveryTime}</span>
            </p>
          )}

          <dl className="glass mb-6 rounded-2xl px-6 py-2">
            <InfoRow label="Article no." value={product.id} />
            <InfoRow label="EAN" value={product.ean} />
            <InfoRow label="Manufacturer" value={product.manufacturer} />
            <InfoRow label="Weight" value={product.weight ? `${product.weight} kg` : undefined} />
            <InfoRow label="Category" value={categoryPath} />
            <InfoRow label="Disposal cost" value={product.disposalCost} />
          </dl>

          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <div>
              <h2
                className="mb-4 text-sm font-semibold tracking-widest text-slate-400 uppercase"
                style={{ fontFamily: "var(--font-outfit), sans-serif" }}
              >
                Specifications
              </h2>
              <dl className="glass rounded-2xl px-6 py-2">
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
