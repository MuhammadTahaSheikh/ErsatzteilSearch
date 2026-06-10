"use client";

import { useEffect, useState } from "react";
import { ProductGrid } from "@/components/ProductGrid";
import { SearchBar } from "@/components/SearchBar";
import { useProductSearch } from "@/hooks/useProductSearch";

const SUGGESTIONS = ["SONY", "HDMI", "AEG"];

export function ProductSearchPage() {
  const [query, setQuery] = useState("");
  const [testMode, setTestMode] = useState(false);
  const { products, total, loading, error } = useProductSearch(query);

  useEffect(() => {
    fetch("/api/health/eed")
      .then((r) => r.json())
      .then((data) => setTestMode(Boolean(data.testMode && !data.mockMode)))
      .catch(() => {});
  }, []);

  const showEmptyHint = query.trim().length < 2;
  const showNoResults = !showEmptyHint && !loading && products.length === 0 && !error;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10 text-center">
        <p className="mb-2 text-sm font-semibold tracking-widest text-orange-600 uppercase">
          Spare Parts Search
        </p>
        <h1 className="mb-3 text-3xl font-bold text-slate-900 sm:text-4xl">
          Find the right part, fast
        </h1>
        <p className="mx-auto max-w-xl text-slate-600">
          Search thousands of spare parts and accessories. Results update as you type.
        </p>
      </header>

      {testMode && (
        <div className="mx-auto mb-6 max-w-2xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-900">
          Connected to the EED <strong>test API</strong>. Only these search terms work:{" "}
          {SUGGESTIONS.join(", ")}.
        </div>
      )}

      <div className="mb-8 flex justify-center">
        <SearchBar value={query} onChange={setQuery} loading={loading} />
      </div>

      {showEmptyHint && (
        <div className="text-center">
          <p className="mb-4 text-slate-500">Try searching for:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {SUGGESTIONS.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => setQuery(term)}
                className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-700 transition hover:border-orange-400 hover:text-orange-700"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mx-auto max-w-xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
          <p>{error}</p>
          {testMode && (
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setQuery(term)}
                  className="rounded-full bg-white px-3 py-1 text-xs font-medium text-red-800 ring-1 ring-red-200"
                >
                  Try {term}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {!showEmptyHint && !error && (
        <p className="mb-5 text-sm text-slate-500">
          {loading ? "Searching…" : `${total} result${total === 1 ? "" : "s"} for "${query}"`}
        </p>
      )}

      {showNoResults && (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center">
          <p className="text-lg font-medium text-slate-700">No products found</p>
          <p className="mt-1 text-sm text-slate-500">Try a different search term</p>
        </div>
      )}

      {products.length > 0 && <ProductGrid products={products} />}
    </div>
  );
}
