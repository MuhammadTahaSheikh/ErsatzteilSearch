"use client";

import { useEffect, useState } from "react";
import { ProductGrid } from "@/components/ProductGrid";
import { SearchBar } from "@/components/SearchBar";
import { useProductSearch } from "@/hooks/useProductSearch";

const SUGGESTIONS = ["SONY", "HDMI", "AEG", "SICHERUNG"];

const FEATURES = [
  { icon: "⚡", label: "Instant results" },
  { icon: "🔍", label: "Live search" },
  { icon: "📦", label: "Real stock data" },
];

export function ProductSearchPage() {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initial = params.get("q");
    if (initial) setQuery(initial);
  }, []);

  const { products, total, loading, error } = useProductSearch(query);

  const showEmptyHint = query.trim().length < 2;
  const showNoResults = !showEmptyHint && !loading && products.length === 0 && !error;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <header className="mb-12 text-center">
        <p className="hero-badge animate-fade-up mx-auto mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold tracking-widest text-[var(--accent)] uppercase">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent)]" />
          </span>
          Spare Parts Search
        </p>
        <h1 className="animate-fade-up animate-delay-1 mb-4 text-4xl font-bold tracking-tight text-[var(--foreground)] sm:text-5xl lg:text-6xl">
          Find the right part,{" "}
          <span className="gradient-text">fast</span>
        </h1>
        <p className="animate-fade-up animate-delay-2 mx-auto max-w-xl text-lg text-[var(--muted)]">
          Search thousands of spare parts and accessories. Results update as you type.
        </p>

        <div className="animate-fade-up animate-delay-3 mt-8 flex flex-wrap items-center justify-center gap-4">
          {FEATURES.map((feature) => (
            <span
              key={feature.label}
              className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)]/60 px-4 py-2 text-sm text-[var(--muted)] backdrop-blur-sm"
            >
              <span aria-hidden>{feature.icon}</span>
              {feature.label}
            </span>
          ))}
        </div>
      </header>

      <div className="animate-fade-up animate-delay-4 mb-10 flex justify-center">
        <SearchBar value={query} onChange={setQuery} loading={loading} />
      </div>

      {showEmptyHint && (
        <div className="animate-fade-in animate-delay-5 text-center">
          <p className="mb-4 text-[var(--muted)]">Try searching for:</p>
          <div className="flex flex-wrap justify-center gap-3">
            {SUGGESTIONS.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => setQuery(term)}
                className="suggestion-chip rounded-full border border-[var(--border)] bg-[var(--surface)]/80 px-5 py-2 text-sm font-medium text-[var(--foreground)] backdrop-blur-sm hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="animate-scale-in mx-auto max-w-xl rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-center text-sm text-red-500 backdrop-blur-sm dark:text-red-400">
          {error}
        </div>
      )}

      {!showEmptyHint && !error && (
        <p className="animate-fade-in mb-6 text-sm text-[var(--muted)]">
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--accent)]" />
              Searching…
            </span>
          ) : (
            <>
              <span className="font-semibold text-[var(--foreground)]">{total}</span> result
              {total === 1 ? "" : "s"} for &ldquo;{query}&rdquo;
            </>
          )}
        </p>
      )}

      {showNoResults && (
        <div className="animate-scale-in rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)]/50 py-20 text-center backdrop-blur-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-3xl">
            🔎
          </div>
          <p className="text-lg font-medium text-[var(--foreground)]">No products found</p>
          <p className="mt-2 text-sm text-[var(--muted)]">Try a different search term</p>
        </div>
      )}

      {loading && products.length === 0 && !showEmptyHint && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]"
            >
              <div className="skeleton-shimmer aspect-square" />
              <div className="space-y-3 p-4">
                <div className="skeleton-shimmer h-3 w-1/3 rounded" />
                <div className="skeleton-shimmer h-4 w-full rounded" />
                <div className="skeleton-shimmer h-4 w-2/3 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {products.length > 0 && <ProductGrid products={products} searchQuery={query} />}
    </div>
  );
}
