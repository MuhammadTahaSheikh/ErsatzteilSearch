"use client";

import { useCallback, useEffect, useState } from "react";
import type { NormalizedProduct } from "@/lib/types";

export const TEST_SEARCH_TERMS = ["SONY", "AEG", "HDMI"] as const;

const TEST_HINT = "Test API only supports: SONY, AEG, HDMI — click a button below";

function isExactTestTerm(query: string): boolean {
  return TEST_SEARCH_TERMS.includes(
    query.trim().toUpperCase() as (typeof TEST_SEARCH_TERMS)[number],
  );
}

interface UseProductSearchResult {
  products: NormalizedProduct[];
  total: number;
  loading: boolean;
  error: string | null;
  hint: string | null;
  testMode: boolean;
  query: string;
  search: (term: string) => void;
}

export function useProductSearch(): UseProductSearchResult {
  const [query, setQuery] = useState("");
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
      .then((data) => {
        const isTest = Boolean(data.testMode);
        setTestMode(isTest);
        if (isTest) {
          setQuery("SONY");
        }
      })
      .catch(() => setTestMode(false))
      .finally(() => setConfigReady(true));
  }, []);

  const fetchProducts = useCallback(async (searchQuery: string, signal: AbortSignal) => {
    const normalized = searchQuery.trim().toUpperCase();

    if (!normalized) {
      setProducts([]);
      setTotal(0);
      setError(null);
      setHint(null);
      setLoading(false);
      return;
    }

    if (testMode && !isExactTestTerm(normalized)) {
      setProducts([]);
      setTotal(0);
      setError(null);
      setHint(TEST_HINT);
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

      const apiMessage = data.error ?? data.hint ?? "";
      const isTestMessage = apiMessage.includes("Test mode only possible");

      if (!response.ok && !isTestMessage) {
        throw new Error(apiMessage || "Search failed");
      }

      setProducts(data.products ?? []);
      setTotal(data.total ?? 0);
      setHint(data.products?.length ? null : (data.hint ?? null));
      setError(isTestMessage ? null : null);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      const message = err instanceof Error ? err.message : "Search failed";
      setProducts([]);
      setTotal(0);
      setHint(message.includes("Test mode only possible") ? TEST_HINT : null);
      setError(message.includes("Test mode only possible") ? null : message);
    } finally {
      setLoading(false);
    }
  }, [testMode]);

  useEffect(() => {
    if (!configReady || !query) return;

    const controller = new AbortController();
    void fetchProducts(query, controller.signal);

    return () => controller.abort();
  }, [query, configReady, fetchProducts]);

  const search = useCallback((term: string) => {
    setQuery(term.trim().toUpperCase());
    setHint(null);
    setError(null);
  }, []);

  return { products, total, loading, error, hint, testMode, query, search };
}
