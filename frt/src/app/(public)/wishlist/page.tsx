'use client'

import { WishlistAction } from '@/api-actions/wishlist-actions'
import { ProductCard } from '@/components/base/product-card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Heart, Loader2, X } from 'lucide-react'
import Link from 'next/link'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'


export default function WishlistPage() {
  const { toast } = useToast()

  const queryClient = useQueryClient()
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      return await WishlistAction.GetWishlistAction({
        sortOrder: 'desc',
        limit: 50  // Get all items in one page
      })
    }
  })

  const clearWishlistMutation = useMutation({
    mutationFn: WishlistAction.ClearWishlistAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message
      })
    }
  })

  const removeFromWishlistMutation = useMutation({
    mutationFn: WishlistAction.RemoveFromWishlistAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message
      })
    }
  })

  const handleAddToCart = (productId: string) => {
    console.log("Added to cart:", productId)
    // Add your cart logic here
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background pt-24 px-8 pb-8">
        <div className="max-w-6xl mx-auto flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background pt-24 px-8 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-destructive mb-2">Error Loading Wishlist</h2>
            <p className="text-muted-foreground">
              {error instanceof Error ? error.message : 'Something went wrong'}
            </p>
          </div>
        </div>
      </main>
    )
  }

  // Empty state
  if (!data?.items?.length) {
    return (
      <main className="bg-background pt-24 px-8 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center py-12">
            <Heart className="w-20 h-20 text-muted-foreground/50" />
            <h1 className="text-2xl font-semibold">Wishlist is empty.</h1>
            <p className="text-muted-foreground">
              You don't have any products in the wishlist yet.
            </p>
            <p className="text-muted-foreground">
              You will find a lot of interesting products on our{' '}
              <Link href="/" className="text-primary hover:underline">
                Shop
              </Link>{' '}
              page.
            </p>
            <Link href="/">
              <Button size="lg">
                RETURN TO SHOP
              </Button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  // Wishlist items display
  return (
    <main className="min-h-screen bg-background pt-24 px-8 pb-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">My Wishlist</h1>
          <div className="flex items-center gap-4">
            <p className="text-muted-foreground">
              {data.items.length} items
            </p>
            <Button 
              variant="outline" 
              onClick={() => clearWishlistMutation.mutate()}
              disabled={clearWishlistMutation.isPending}
            >
              {clearWishlistMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Clear Wishlist
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.items.map((item) => {
            // Convert IProductWishlist to IProduct
            const product: IProduct = {
              ...item.product,
              description: '', // Add missing required fields
              categoryId: '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            return (
              <div key={item.id} className="relative group">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeFromWishlistMutation.mutate({ productId: item.product.id })}
                  disabled={removeFromWishlistMutation.isPending}
                >
                  {removeFromWishlistMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                </Button>
                <ProductCard 
                  key={item.id} 
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              </div>
            );
          })}
        </div>
      </div>
    </main>
  )
}
