"use client";

import { useCallback, useEffect, useState } from "react";
import type { NormalizedProduct } from "@/lib/types";

interface UseProductSearchResult {
  products: NormalizedProduct[];
  total: number;
  loading: boolean;
  error: string | null;
  mockFallback: boolean;
}

export function useProductSearch(query: string, debounceMs = 350): UseProductSearchResult {
  const [products, setProducts] = useState<NormalizedProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mockFallback, setMockFallback] = useState(false);

  const fetchProducts = useCallback(async (searchQuery: string, signal: AbortSignal) => {
    if (searchQuery.trim().length < 2) {
      setProducts([]);
      setTotal(0);
      setError(null);
      setMockFallback(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setMockFallback(false);

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery.trim())}`,
        { signal },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Search failed");
      }

      setProducts(data.products ?? []);
      setTotal(data.total ?? 0);
      setMockFallback(Boolean(data.mockFallback));
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setProducts([]);
      setTotal(0);
      setMockFallback(false);
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      void fetchProducts(query, controller.signal);
    }, debounceMs);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query, debounceMs, fetchProducts]);

  return { products, total, loading, error, mockFallback };
}
