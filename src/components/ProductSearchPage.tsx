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
          {testMode
            ? "Test API — select one of the allowed keywords below."
            : "Search spare parts and accessories with instant results."}
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

      {testMode ? (
        <div className="animate-fade-up stagger-4 mb-10 text-center">
          <p className="mb-4 text-sm text-slate-500">Select a test keyword</p>
          <div className="flex flex-wrap justify-center gap-3">
            {TEST_SEARCH_TERMS.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => search(term)}
                className={`chip-hover rounded-full px-6 py-2.5 text-sm font-semibold transition ${
                  query === term
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                    : "glass text-slate-300"
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
        <div className="animate-scale-in mx-auto mb-6 max-w-xl rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-center text-sm text-amber-200">
          {hint}
        </div>
      )}

      {error && (
        <div className="animate-scale-in mx-auto max-w-xl rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-center text-sm text-red-300">
          {error}
        </div>
      )}

      {query && !error && !hint && (
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
          <p className="text-lg font-semibold text-white">No products found</p>
          <p className="mt-2 text-sm text-slate-500">Try SONY, AEG, or HDMI</p>
        </div>
      )}

      {products.length > 0 && <ProductGrid products={products} />}
    </div>
  );
}
