"use client"

import { Heart, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query"
import { WishlistAction } from "@/api-actions/wishlist-actions"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface ProductCardProps {
  product: IProduct;
  onAddToCart?: (productId: string) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

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
    // Don't refetch on window focus
    refetchOnWindowFocus: false
  })

  // Mutation for toggling wishlist status
  const toggleWishlistMutation = useMutation({
    mutationFn: () => {
      if (wishlistData?.isWishlisted) {
        return WishlistAction.RemoveFromWishlistAction({ productId: product.id })
      } else {
        return WishlistAction.AddToWishlistAction({ productId: product.id })
      }
    },
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['wishlist'] })
      
      // Snapshot the previous value
      const previousWishlist = queryClient.getQueryData(['wishlist'])
      
      // Optimistically update the wishlist
      queryClient.setQueryData(['wishlist'], (old: IGetWishlistResponse | undefined) => {
        if (!old) return { items: [], pagination: { total: 0 } }
        
        if (wishlistData?.isWishlisted) {
          // Remove from wishlist
          return {
            ...old,
            items: old.items.filter(item => item.product.id !== product.id)
          }
        } else {
          // Add to wishlist
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
      
      return { previousWishlist }
    },
    onError: (error, variables, context) => {
      // Revert the optimistic update on error
      if (context?.previousWishlist) {
        queryClient.setQueryData(['wishlist'], context.previousWishlist)
      }
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update wishlist"
      })
    },
    onSuccess: () => {
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
            onAddToCart?.(product.id);
          }} 
          className="flex-1" 
          size="sm"
          disabled={!product.isActive || product.stock === 0}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {product.isActive ? 'Add to Cart' : 'Out of Stock'}
        </Button>

        {/* Wishlist Button */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={(e) => {
            e.preventDefault();
            toggleWishlistMutation.mutate();
          }} 
          disabled={toggleWishlistMutation.isPending}
          className="px-3"
        >
          <Heart 
            className={cn(
              "w-4 h-4 transition-colors",
              wishlistData?.isWishlisted && "fill-destructive text-destructive",
              toggleWishlistMutation.isPending && "fill-destructive text-destructive"
            )} 
          />
        </Button>
      </div>
    </div>
  )
}
