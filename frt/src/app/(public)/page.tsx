'use client'
import { ProductCard } from "@/components/base/product-card";
import { useGetProducts } from "@/components/base/productcard";
import { Loader2 } from "lucide-react";

export default function ProductsPage() {
  const { data, isLoading, isError, error } = useGetProducts({
    page: 1,
    limit: 12,
    isActive: true,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-2">
            Error Loading Products
          </h2>
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : 'Something went wrong'}
          </p>
        </div>
      </div>
    );
  }

  if (!data?.products || data.products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">No Products Found</h2>
          <p className="text-muted-foreground">
            Check back later for new products
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Our Products</h1>
        <p className="text-muted-foreground">
          Showing {data.products.length} of {data.pagination.total} products
        </p>
      </div>

      {/* Key fix: Use gap-6 and padding */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data.products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        Page {data.pagination.page} of {data.pagination.totalPages}
      </div>
    </div>
  );
}
