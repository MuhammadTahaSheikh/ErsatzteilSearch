import Link from "next/link";
import { ProductDetailView } from "@/components/ProductDetailView";
import {
  EedApiError,
  getProductDetails,
  hashCustomerIp,
  resolveClientIp,
} from "@/lib/eed";
import {
  getSessionId,
  resolveShopUrlFromHost,
  setSessionId,
} from "@/lib/session";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const headersList = await headers();
  const sessionId = (await getSessionId()) ?? "auto";
  const shopUrl = resolveShopUrlFromHost(
    headersList.get("host"),
    headersList.get("referer"),
  );
  const customerIpHash = hashCustomerIp(
    resolveClientIp(headersList.get("x-forwarded-for")),
  );

  try {
    const result = await getProductDetails(id, {
      sessionId,
      shopUrl,
      customerIpHash,
    });

    if (result.sessionId) {
      await setSessionId(result.sessionId);
    }

    return <ProductDetailView product={result.product} />;
  } catch (error) {
    if (error instanceof EedApiError) {
      return (
        <div className="mx-auto max-w-lg px-4 py-24 text-center">
          <div className="alert-error animate-scale-in mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h1
            className="text-heading mb-3 text-2xl font-bold"
            style={{ fontFamily: "var(--font-outfit), sans-serif" }}
          >
            Product unavailable
          </h1>
          <p className="text-body mb-8">{error.message}</p>
          <Link
            href="/"
            className="chip-active inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium"
          >
            ← Back to search
          </Link>
        </div>
      );
    }
    notFound();
  }
}
