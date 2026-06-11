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
      <div className="flex aspect-square items-center justify-center rounded-xl bg-slate-100 text-slate-400">
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
    <div className="relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-white">
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
    <div className="flex justify-between gap-4 border-b border-slate-100 py-3 text-sm last:border-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-900">{value}</dd>
    </div>
  );
}

export function ProductDetailView({ product, searchQuery }: ProductDetailViewProps) {
  const categoryPath = product.categoryPath?.map((g) => g.vgruppenname).join(" › ");
  const backHref = searchQuery
    ? `/?q=${encodeURIComponent(searchQuery)}`
    : "/";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href={backHref}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-orange-600 hover:text-orange-700"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to search
      </Link>

      <div className="grid gap-10 lg:grid-cols-2">
        <DetailImage product={product} />

        <div>
          {product.category && (
            <p className="mb-2 text-sm font-semibold tracking-wide text-orange-600 uppercase">
              {product.category}
            </p>
          )}
          <h1 className="mb-4 text-2xl leading-tight font-bold text-slate-900 sm:text-3xl">
            {product.name}
          </h1>

          <div className="mb-6 flex flex-wrap items-center gap-3">
            <p className="text-3xl font-bold text-slate-900">{product.price}</p>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                product.available
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {product.available ? "Available" : "Not available"}
            </span>
          </div>

          {product.deliveryTime && (
            <p className="mb-6 text-sm text-slate-600">
              Delivery: <span className="font-medium">{product.deliveryTime}</span>
            </p>
          )}

          <dl className="rounded-xl border border-slate-200 bg-white px-5">
            <InfoRow label="Article no." value={product.id} />
            <InfoRow label="EAN" value={product.ean} />
            <InfoRow label="Manufacturer" value={product.manufacturer} />
            <InfoRow label="Category" value={categoryPath ?? product.category} />
            <InfoRow label="Disposal cost" value={product.disposalCost} />
          </dl>

          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <div className="mt-6">
              <h2 className="mb-3 text-sm font-semibold text-slate-900 uppercase tracking-wide">
                Specifications
              </h2>
              <dl className="rounded-xl border border-slate-200 bg-white px-5">
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
