"use client";

import { useState } from "react";
import { ProductGrid } from "@/components/ProductGrid";
import { SearchBar } from "@/components/SearchBar";
import { useProductSearch } from "@/hooks/useProductSearch";

const SUGGESTIONS = ["SONY", "HDMI", "AEG"];

const STATS = [
  { label: "Brands", value: "500+" },
  { label: "Parts", value: "2M+" },
  { label: "Delivery", value: "24h" },
];

export function ProductSearchPage() {
  const [query, setQuery] = useState("");
  const { products, total, loading, error, hint } = useProductSearch(query);

  const showEmptyHint = query.trim().length < 2;
  const showNoResults =
    !showEmptyHint && !loading && products.length === 0 && !error && !hint;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      {/* Hero */}
      <header className="mb-12 text-center lg:mb-16">
        <div className="animate-fade-up mb-4 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-orange-300 uppercase">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-400" />
          Spare Parts Search
        </div>
        <h1
          className="animate-fade-up stagger-1 mb-4 text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl lg:text-6xl"
          style={{ fontFamily: "var(--font-outfit), sans-serif" }}
        >
          Find the right part,{" "}
          <span className="text-gradient">fast</span>
        </h1>
        <p className="animate-fade-up stagger-2 mx-auto mb-8 max-w-2xl text-lg text-slate-400">
          Search spare parts and accessories with instant results. Type a brand,
          model, or part number — we&apos;ll find it.
        </p>

        <div className="animate-fade-up stagger-3 mb-10 flex flex-wrap justify-center gap-6 sm:gap-10">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p
                className="text-2xl font-bold text-white sm:text-3xl"
                style={{ fontFamily: "var(--font-outfit), sans-serif" }}
              >
                {stat.value}
              </p>
              <p className="text-xs tracking-wider text-slate-500 uppercase">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </header>

      <div className="animate-fade-up stagger-4 mb-10 flex justify-center">
        <SearchBar value={query} onChange={setQuery} loading={loading} />
      </div>

      {showEmptyHint && (
        <div className="animate-fade-in text-center">
          <p className="mb-5 text-sm text-slate-500">Popular searches</p>
          <div className="flex flex-wrap justify-center gap-3">
            {SUGGESTIONS.map((term, i) => (
              <button
                key={term}
                type="button"
                onClick={() => setQuery(term)}
                className={`chip-hover glass rounded-full px-5 py-2 text-sm font-medium text-slate-300 stagger-${i + 1}`}
                style={{
                  animation: `fade-up 0.5s ease ${0.1 + i * 0.08}s forwards`,
                  opacity: 0,
                }}
              >
                <span className="mr-1.5 text-orange-400">→</span>
                {term}
              </button>
            ))}
          </div>
          <p className="mt-8 text-xs text-slate-600">
            Test keywords: <span className="text-slate-400">SONY</span>,{" "}
            <span className="text-slate-400">AEG</span>,{" "}
            <span className="text-slate-400">HDMI</span>
          </p>
        </div>
      )}

      {hint && (
        <div className="animate-scale-in mx-auto mb-6 max-w-xl rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-center text-sm text-amber-200">
          {hint}
        </div>
      )}

      {error && (
        <div className="animate-scale-in mx-auto max-w-xl rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-center text-sm text-red-300">
          {error}
        </div>
      )}

      {!showEmptyHint && !error && !hint && (
        <p className="animate-fade-in mb-6 flex items-center gap-2 text-sm text-slate-400">
          {loading ? (
            <>
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-orange-400" />
              Searching…
            </>
          ) : (
            <>
              <span className="font-semibold text-orange-400">{total}</span>
              result{total === 1 ? "" : "s"} for &ldquo;{query}&rdquo;
            </>
          )}
        </p>
      )}

      {showNoResults && (
        <div className="animate-scale-in glass mx-auto max-w-lg rounded-2xl py-20 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800/50 text-slate-500">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </div>
          <p className="text-lg font-semibold text-white">No products found</p>
          <p className="mt-2 text-sm text-slate-500">
            Try SONY, AEG, or HDMI
          </p>
        </div>
      )}

      {products.length > 0 && <ProductGrid products={products} />}
    </div>
  );
}
