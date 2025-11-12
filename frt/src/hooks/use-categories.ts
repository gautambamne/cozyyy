import { useQuery } from "@tanstack/react-query";
import { CategoryAction } from "@/api-actions/category-actions";
import type { IGetCategoryResposne } from "@/types/category";
import { IGetCategoriesQuerySchema } from "@/schema/category-schema";

const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (params?: Partial<IGetCategoriesQuerySchema>) => [...categoryKeys.lists(), { params }] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
};

export function useCategories() {
  return useQuery<IGetCategoryResposne>({
    queryKey: categoryKeys.lists(),
    queryFn: () => CategoryAction.GetCategoriesAction(),
    staleTime: 5 * 60 * 1000, // Data remains fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Cache persists for 10 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => CategoryAction.GetCategoryAction({ id }),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // Data remains fresh for 5 minutes
  });
}

export function useActiveCategories() {
  return useQuery<IActiveCategory>({
    queryKey: [...categoryKeys.all, 'active'] as const,
    queryFn: () => CategoryAction.GetActiveCategoriesAction(),
    staleTime: 5 * 60 * 1000, // Data remains fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Cache persists for 10 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}
