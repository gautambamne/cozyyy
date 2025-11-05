'use client';

import { useQuery } from '@tanstack/react-query';
import { ProductAction } from '@/api-actions/product-actions';
import type { IGetProductsQuerySchema } from '@/schema/product-schema';

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params?: Partial<IGetProductsQuerySchema>) => [...productKeys.lists(), { params }] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

export function useProducts(params?: Partial<IGetProductsQuerySchema>) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => ProductAction.GetProductsAction(params),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => ProductAction.GetProductByIdAction({ id }),
    enabled: !!id,
  });
}