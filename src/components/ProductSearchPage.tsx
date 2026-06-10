"use client";

import { ProductGrid } from "@/components/ProductGrid";
import { SearchBar } from "@/components/SearchBar";
import { TEST_SEARCH_TERMS, useProductSearch } from "@/hooks/useProductSearch";

const STATS = [
  { label: "Brands", value: "500+" },
  { label: "Parts", value: "2M+" },
  { label: "Delivery", value: "24h" },
];

export function ProductSearchPage() {
  const { products, total, loading, error, hint, testMode, query, search } =
    useProductSearch();

  const showNoResults =
    Boolean(query) && !loading && products.length === 0 && !error && !hint;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <header className="mb-12 text-center lg:mb-16">
        <div className="animate-fade-up badge-pill mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold tracking-widest uppercase">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-500" />
          Spare Parts Search
        </div>
        <h1
          className="animate-fade-up stagger-1 text-heading mb-4 text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl lg:text-6xl"
          style={{ fontFamily: "var(--font-outfit), sans-serif" }}
        >
          Find the right part,{" "}
          <span className="text-gradient">fast</span>
        </h1>
        <p className="animate-fade-up stagger-2 text-body mx-auto mb-8 max-w-2xl text-lg">
          {testMode
            ? "Test API — select one of the allowed keywords below."
            : "Search spare parts and accessories with instant results."}
        </p>

        <div className="animate-fade-up stagger-3 mb-10 flex flex-wrap justify-center gap-6 sm:gap-10">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p
                className="text-heading text-2xl font-bold sm:text-3xl"
                style={{ fontFamily: "var(--font-outfit), sans-serif" }}
              >
                {stat.value}
              </p>
              <p className="text-subtle text-xs tracking-wider uppercase">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </header>

      {testMode ? (
        <div className="animate-fade-up stagger-4 mb-10 text-center">
          <p className="text-muted mb-4 text-sm">Select a test keyword</p>
          <div className="flex flex-wrap justify-center gap-3">
            {TEST_SEARCH_TERMS.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => search(term)}
                className={`rounded-full px-6 py-2.5 text-sm font-semibold transition ${
                  query === term ? "chip-active" : "chip"
                }`}
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="animate-fade-up stagger-4 mb-10 flex justify-center">
          <SearchBar
            value={query}
            onChange={(value) => search(value)}
            loading={loading}
          />
        </div>
      )}

      {hint && (
        <div className="animate-scale-in alert-warning mx-auto mb-6 max-w-xl rounded-2xl px-5 py-4 text-center text-sm">
          {hint}
        </div>
      )}

      {error && (
        <div className="animate-scale-in alert-error mx-auto max-w-xl rounded-2xl px-5 py-4 text-center text-sm">
          {error}
        </div>
      )}

      {query && !error && !hint && (
        <p className="animate-fade-in text-muted mb-6 flex items-center gap-2 text-sm">
          {loading ? (
            <>
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-orange-500" />
              Searching…
            </>
          ) : (
            <>
              <span className="text-accent font-semibold">{total}</span>
              result{total === 1 ? "" : "s"} for &ldquo;{query}&rdquo;
            </>
          )}
        </p>
      )}

      {showNoResults && (
        <div className="animate-scale-in surface mx-auto max-w-lg rounded-2xl py-20 text-center">
          <div className="text-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--card-image-bg)]">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </div>
          <p className="text-heading text-lg font-semibold">No products found</p>
          <p className="text-muted mt-2 text-sm">Try SONY, AEG, or HDMI</p>
        </div>
      )}

      {products.length > 0 && <ProductGrid products={products} />}
    </div>
  );
}
