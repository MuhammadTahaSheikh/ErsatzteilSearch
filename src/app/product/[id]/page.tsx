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
          <h1 className="mb-2 text-xl font-bold text-slate-900">Product unavailable</h1>
          <p className="mb-6 text-slate-600">{error.message}</p>
          <Link href="/" className="font-medium text-orange-600 hover:text-orange-700">
            ← Back to search
          </Link>
        </div>
      );
    }
    notFound();
  }
}
