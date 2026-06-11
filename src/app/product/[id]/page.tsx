import Link from "next/link";
import { ProductDetailView } from "@/components/ProductDetailView";
import {
  EedApiError,
  getProductDetails,
  hashCustomerIp,
  resolveClientIp,
} from "@/lib/eed";
import { resolveShopUrlFromHost } from "@/lib/session";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

interface ProductPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string }>;
}

export default async function ProductPage({ params, searchParams }: ProductPageProps) {
  const { id } = await params;
  const { q: searchQuery } = await searchParams;
  const headersList = await headers();
  const baseShopUrl = resolveShopUrlFromHost(
    headersList.get("host"),
    headersList.get("referer"),
  );
  const shopUrl = `${baseShopUrl.replace(/\/$/, "")}/product/${encodeURIComponent(id)}`;
  const customerIpHash = hashCustomerIp(
    resolveClientIp(headersList.get("x-forwarded-for")),
  );

  try {
    const result = await getProductDetails(
      id,
      {
        sessionId: "auto",
        shopUrl,
        customerIpHash,
      },
      searchQuery,
    );

    return <ProductDetailView product={result.product} searchQuery={searchQuery} />;
  } catch (error) {
    if (error instanceof EedApiError) {
      return (
        <div className="mx-auto max-w-lg px-4 py-20 text-center">
          <div className="animate-scale-in mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-3xl">
            ⚠️
          </div>
          <h1 className="mb-2 text-xl font-bold text-[var(--foreground)]">Product unavailable</h1>
          <p className="mb-6 text-[var(--muted)]">{error.message}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 font-medium text-[var(--accent)] transition hover:border-[var(--accent)]"
          >
            ← Back to search
          </Link>
        </div>
      );
    }
    notFound();
  }
}
