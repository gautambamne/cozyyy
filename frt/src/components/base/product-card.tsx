"use client"

import { Heart, ShoppingCart, Loader2 } from "lucide-react"
import { useCartStore } from "@/store/cart-store"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query"
import { WishlistAction } from "@/api-actions/wishlist-actions"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import useAuthStore from "@/store/auth-store"
import { useEffect } from "react"

interface ProductCardProps {
  product: IProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)
  const { addItem } = useCartStore()

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated) {
        throw new Error("Please login to add items to cart")
      }
      return await addItem(product.id, 1)
    },
    onSuccess: () => {
      // Invalidate cart query to refetch updated cart data
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add item to cart"
      })
    }
  })

  // Effect to clear wishlist data on logout
  useEffect(() => {
    if (!isAuthenticated) {
      queryClient.setQueryData(['wishlist'], { items: [], pagination: { total: 0 } })
    }
  }, [isAuthenticated, queryClient])

  // Query to check if product is in wishlist
  const { data: wishlistData } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      return await WishlistAction.GetWishlistAction({
        sortOrder: 'desc',
        limit: 50
      })
    },
    select: (data: IGetWishlistResponse) => {
      const item = data?.items?.find(item => item.product.id === product.id)
      return { isWishlisted: !!item, item }
    },
    refetchOnWindowFocus: false,
    enabled: isAuthenticated,
    initialData: { items: [], pagination: { page: 1, limit: 50, total: 0, totalPages: 0 }, message: '' }
  })

  // Mutation for toggling wishlist status
  const toggleWishlistMutation = useMutation({
    mutationFn: () => {
      if (!isAuthenticated) {
        throw new Error("Please login to add items to wishlist")
      }
      if (wishlistData?.isWishlisted) {
        return WishlistAction.RemoveFromWishlistAction({ productId: product.id })
      } else {
        return WishlistAction.AddToWishlistAction({ productId: product.id })
      }
    },
    onMutate: async () => {
      // Cancel any outgoing refetches to prevent them from overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ['wishlist'] })
      
      // Snapshot the previous value
      const previousWishlist = queryClient.getQueryData(['wishlist'])
      
      // Store whether we're adding or removing
      const isAdding = !wishlistData?.isWishlisted
      
      // Optimistically update the wishlist immediately
      queryClient.setQueryData(['wishlist'], (old: IGetWishlistResponse | undefined) => {
        if (!old) return { items: [], pagination: { total: 0 }, message: '' }
        
        if (!isAdding) {
          // Remove from wishlist - heart turns gray immediately
          return {
            ...old,
            items: old.items.filter(item => item.product.id !== product.id)
          }
        } else {
          // Add to wishlist - heart turns red immediately
          return {
            ...old,
            items: [...old.items, {
              id: 'temp-id',
              userId: 'temp-user',
              productId: product.id,
              addedAt: new Date().toISOString(),
              product: product as IProductWishlist
            }]
          }
        }
      })
      
      return { previousWishlist, isAdding }
    },
    onError: (error, variables, context) => {
      // Revert to previous state only on error
      if (context?.previousWishlist) {
        queryClient.setQueryData(['wishlist'], context.previousWishlist)
      }
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update wishlist"
      })
    },
    onSuccess: () => {
      // On success, optimistic update is already correct, just invalidate to sync
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
    }
  })

  const hasDiscount = typeof product.salePrice === "number" && product.salePrice < product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0;

  const displayPrice = product.salePrice || product.price;
  const isBuyOneGetOne = discountPercentage >= 50;

  return (
    <div className="group flex flex-col bg-card rounded-lg overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow">
      {/* Clickable Link Area */}
      <Link href={`/product/${product.id}`} className="flex-1">
        {/* Image Container */}
        <div className="relative w-full aspect-square bg-muted overflow-hidden">
          <Image 
            src={product.images[0] || "/placeholder.svg"} 
            alt={product.name} 
            fill 
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* BUY 1 GET 1 Badge */}
          {isBuyOneGetOne && (
            <div className="absolute top-3 left-3 bg-destructive text-destructive-foreground px-3 py-1 text-sm font-medium rounded-md">
              BUY 1 GET 1
            </div>
          )}

          {!product.isActive && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
              <span className="text-white font-semibold px-4 py-2 bg-black/70 rounded-md">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Content Container */}
        <div className="flex flex-col flex-1 p-4">
          {/* Product Info */}
          <div className="flex-1">
            <h3 className="font-medium text-foreground text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>

            {/* Price Section */}
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-lg font-semibold text-foreground">₹{displayPrice.toLocaleString('en-IN')}</span>
              {hasDiscount && (
                <>
                  <span className="text-sm text-muted-foreground line-through">₹{product.price.toLocaleString('en-IN')}</span>
                  <span className="text-sm font-medium text-green-600">({discountPercentage}% OFF)</span>
                </>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* Button Container - Outside of Link to prevent click propagation */}
      <div className="flex gap-2 p-4 pt-0">
        {/* Add to Cart Button */}
        <Button 
          onClick={(e) => {
            e.preventDefault();
            addToCartMutation.mutate();
          }} 
          className="flex-1" 
          size="sm"
          disabled={!product.isActive || product.stock === 0 || addToCartMutation.isPending}
        >
          {addToCartMutation.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <ShoppingCart className="w-4 h-4 mr-2" />
          )}
          {!product.isActive ? 'Out of Stock' : 
           addToCartMutation.isPending ? 'Adding...' : 'Add to Cart'}
        </Button>

        {/* Wishlist Button */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={(e) => {
            e.preventDefault();
            toggleWishlistMutation.mutate();
          }} 
          className="px-3 relative"
        >
          <Heart 
            className={cn(
              "w-4 h-4 transition-colors duration-200",
              wishlistData?.isWishlisted && "fill-destructive text-destructive"
            )} 
          />
        </Button>
      </div>
    </div>
  )
}