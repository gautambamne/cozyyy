import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ProductAction } from '@/api-actions/product-actions'
import { 
  IGetProductsQuerySchema, 
  IGetProductSchema,
  ICreateProductSchema,
  IUpdateProductSchema 
} from '@/schema/product-schema'

// Query Keys
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params?: Partial<IGetProductsQuerySchema>) => [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  category: (categoryId: string, params?: Omit<IGetProductsQuerySchema, 'categoryId'>) => 
    [...productKeys.all, 'category', categoryId, params] as const,
}

// Get Products Hook
export const useGetProducts = (params?: Partial<IGetProductsQuerySchema>) => {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => ProductAction.GetProductsAction(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Get Product By ID Hook
export const useGetProductById = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => ProductAction.GetProductByIdAction({ id }),
    enabled: !!id && enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Get Products By Category Hook
export const useGetProductsByCategory = (
  categoryId: string, 
  params?: Omit<IGetProductsQuerySchema, 'categoryId'>,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: productKeys.category(categoryId, params),
    queryFn: () => ProductAction.GetProductsByCategoryAction(categoryId, params),
    enabled: !!categoryId && enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Create Product Hook
export const useCreateProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ data, files }: { 
      data: Omit<ICreateProductSchema, 'images'>, 
      files: File[] 
    }) => ProductAction.CreateProductAction(data, files),
    onSuccess: () => {
      // Invalidate all product lists
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}

// Update Product Hook
export const useUpdateProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ 
      id, 
      data, 
      files 
    }: { 
      id: string
      data: Partial<Omit<IUpdateProductSchema, 'images'>>
      files?: File[] 
    }) => ProductAction.UpdateProductAction(id, data, files),
    onSuccess: (data, variables) => {
      // Invalidate the specific product detail
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.id) })
      // Invalidate all product lists
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}

// Delete Product Hook
export const useDeleteProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: IGetProductSchema) => ProductAction.DeleteProductAction(data),
    onSuccess: () => {
      // Invalidate all product lists
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}