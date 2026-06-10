"use client";

import { useCallback, useEffect, useState } from "react";
import type { NormalizedProduct } from "@/lib/types";

const TEST_SEARCH_TERMS = ["SONY", "AEG", "HDMI"];

interface UseProductSearchResult {
  products: NormalizedProduct[];
  total: number;
  loading: boolean;
  error: string | null;
  hint: string | null;
}

export function useProductSearch(query: string, debounceMs = 350): UseProductSearchResult {
  const [products, setProducts] = useState<NormalizedProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [testMode, setTestMode] = useState(false);
  const [configReady, setConfigReady] = useState(false);

  useEffect(() => {
    fetch("/api/health/eed")
      .then((response) => response.json())
      .then((data) => setTestMode(Boolean(data.testMode)))
      .catch(() => setTestMode(false))
      .finally(() => setConfigReady(true));
  }, []);

  const fetchProducts = useCallback(
    async (searchQuery: string, signal: AbortSignal) => {
      const normalized = searchQuery.trim().toUpperCase();

      if (normalized.length < 2) {
        setProducts([]);
        setTotal(0);
        setError(null);
        setHint(null);
        setLoading(false);
        return;
      }

      if (testMode && !TEST_SEARCH_TERMS.includes(normalized)) {
        setProducts([]);
        setTotal(0);
        setError(null);
        setHint(`Test API only supports: ${TEST_SEARCH_TERMS.join(", ")}`);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setHint(null);

      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(normalized)}`,
          { signal },
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? data.hint ?? "Search failed");
        }

        setProducts(data.products ?? []);
        setTotal(data.total ?? 0);
        setHint(data.hint ?? null);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setProducts([]);
        setTotal(0);
        setHint(null);
        setError(err instanceof Error ? err.message : "Search failed");
      } finally {
        setLoading(false);
      }
    },
    [testMode],
  );

  useEffect(() => {
    if (!configReady) return;

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      void fetchProducts(query, controller.signal);
    }, debounceMs);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query, debounceMs, fetchProducts, configReady]);

  return { products, total, loading, error, hint };
}
