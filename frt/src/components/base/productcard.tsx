'use client';

import { useQuery } from '@tanstack/react-query';
import { ProductAction } from '@/api-actions/product-actions';
import { ProductCard } from './product-card';
import { IGetProductsQuerySchema } from '@/schema/product-schema';

interface ProductGridProps {
  filters?: Partial<IGetProductsQuerySchema>;
}

export const ProductGrid = ({ filters }: ProductGridProps) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => ProductAction.GetProductsAction(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg animate-pulse">
            <div className="aspect-square bg-gray-300" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-300 rounded w-3/4" />
              <div className="h-4 bg-gray-300 rounded w-1/2" />
              <div className="h-10 bg-gray-300 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-red-600 font-medium">Error loading products</p>
          <p className="text-gray-500 text-sm mt-2">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  if (!data?.products?.length) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">No products found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {data.products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
        />
      ))}
    </div>
  );
};