import { useQuery } from "@tanstack/react-query";
import { CategoryAction } from "@/api-actions/category-actions";
import type { IGetCategoryResposne } from "@/types/category";

export function useCategories() {
  return useQuery<IGetCategoryResposne>({
    queryKey: ["categories"],
    queryFn: () => CategoryAction.GetCategoriesAction(),
    staleTime: 5 * 60 * 1000, // Data remains fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Cache persists for 10 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}
