import type { NormalizedProduct } from "@/lib/types";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: NormalizedProduct[];
  searchQuery?: string;
}

export function ProductGrid({ products, searchQuery }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} searchQuery={searchQuery} />
      ))}
    </div>
  );
}
