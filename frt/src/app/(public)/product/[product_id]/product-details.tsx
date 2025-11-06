"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Heart, Check, Package, Loader2 } from "lucide-react"
import { useCartStore } from "@/store/cart-store"
import { useCategory } from "@/hooks/use-categories"
import { Skeleton } from "@/components/ui/skeleton"

const JEWELRY_SIZES = [
  { value: 'SMALL', label: 'S', description: 'Small - Suitable for petite wrists/necks' },
  { value: 'MEDIUM', label: 'M', description: 'Medium - Standard size, fits most' },
  { value: 'LARGE', label: 'L', description: 'Large - Suitable for larger wrists/necks' },
  { value: 'EXTRA_LARGE', label: 'XL', description: 'Extra Large - Designed for extra comfort' },
] as const;

interface ProductDetailsProps {
  product: IProduct;
}

interface SizeSelectorProps {
  availableSize: string;
  onSizeSelect: (size: string) => void;
  selectedSize: string;
}

const SizeSelector = ({ availableSize, onSizeSelect, selectedSize }: SizeSelectorProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Select Size</h3>
        <button 
          type="button"
          className="text-xs text-primary hover:underline"
          onClick={() => {
            const sizeInfo = JEWELRY_SIZES.find(s => s.value === selectedSize);
            if (sizeInfo) {
              alert(`${sizeInfo.label}: ${sizeInfo.description}`);
            }
          }}
        >
          Size Guide
        </button>
      </div>
      <div className="flex items-center gap-4 px-1 overflow-x-auto py-2">
        {JEWELRY_SIZES.map((size) => {
          const isAvailable = size.value === availableSize;
          return (
            <button
              key={size.value}
              onClick={() => isAvailable && onSizeSelect(size.value)}
              disabled={!isAvailable}
              className={`
                flex-none flex items-center justify-center w-14 h-14 border rounded-full text-base font-medium transition-all
                ${selectedSize === size.value && isAvailable
                  ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary ring-offset-2'
                  : isAvailable
                    ? 'border-border hover:border-primary/50 hover:bg-secondary/50'
                    : 'border-border/50 bg-muted/50 text-muted-foreground cursor-not-allowed'
                }
              `}
              title={size.description}
            >
              {size.label}
              {!isAvailable && (
                <span className="sr-only">(Out of Stock)</span>
              )}
            </button>
          );
        })}
      </div>
      <div className="text-xs text-muted-foreground">
        {selectedSize && (
          <p>{JEWELRY_SIZES.find(s => s.value === selectedSize)?.description}</p>
        )}
      </div>
    </div>
  );
};

const CategoryName = ({ categoryId }: { categoryId: string }) => {
  const { data: category, isLoading } = useCategory(categoryId);

  if (isLoading) {
    return <Skeleton className="h-4 w-24" />;
  }

  return <p>Category: {category?.category?.name || 'Unknown'}</p>;
}

const ExpandableSection = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex justify-between items-center w-full py-4 text-sm font-medium"
      >
        {title}
        <span className="text-xl">{isExpanded ? '−' : '+'}</span>
      </button>
      {isExpanded && <div className="pb-4">{children}</div>}
    </div>
  )
}

import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query"
import { WishlistAction } from "@/api-actions/wishlist-actions"
import useAuthStore from "@/store/auth-store"
import { useToast } from "@/hooks/use-toast"

export default function ProductDetails({ product }: ProductDetailsProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)
  const { addItem } = useCartStore()
  const [selectedSize, setSelectedSize] = useState<string>(product.jewelrySize);

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
        description: error.message || "Failed to add item to cart",
      })
    }
  });
  
  // Query to check if product is in wishlist
  const { data: wishlistData } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      return await WishlistAction.GetWishlistAction({
        limit: 50
      })
    },
    select: (data: IGetWishlistResponse) => {
      const item = data?.items?.find(item => item.product.id === product.id)
      return { isWishlisted: !!item, item }
    },
    refetchOnWindowFocus: false,
    enabled: isAuthenticated,
    initialData: { items: [], pagination: { total: 0, page: 1, limit: 50, totalPages: 0 }, message: '' }
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
      await queryClient.cancelQueries({ queryKey: ['wishlist'] })
      const previousWishlist = queryClient.getQueryData(['wishlist'])
      const isAdding = !wishlistData?.isWishlisted
      
      queryClient.setQueryData(['wishlist'], (old: IGetWishlistResponse | undefined) => {
        if (!old) return { items: [], pagination: { total: 0 }, message: '' }
        
        if (!isAdding) {
          return {
            ...old,
            items: old.items.filter(item => item.product.id !== product.id)
          }
        } else {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
        <p className="text-muted-foreground">{product.description}</p>
      </div>

      {/* Price Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold">₹{displayPrice.toLocaleString('en-IN')}</span>
          {hasDiscount && (
            <>
              <span className="text-sm text-muted-foreground line-through">
                MRP ₹{product.price.toLocaleString('en-IN')}
              </span>
              <span className="bg-primary text-primary-foreground px-2 py-1 text-sm font-bold rounded">
                SAVE {discountPercentage}%
              </span>
            </>
          )}
        </div>
        <p className="text-sm text-muted-foreground">Inclusive of all taxes</p>
      </div>

      {/* Size Selector */}
      <SizeSelector
        availableSize={product.jewelrySize}
        selectedSize={selectedSize}
        onSizeSelect={setSelectedSize}
      />

      {/* Stock Status */}
      <div className="flex items-center gap-2 text-sm">
        {product.isActive ? (
          <>
            <Check className="text-green-600" size={18} />
            <span>In stock - {product.stock} units available</span>
          </>
        ) : (
          <span className="text-destructive">Currently unavailable</span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <Button 
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-12 gap-2"
            disabled={!product.isActive || product.stock === 0 || addToCartMutation.isPending}
            onClick={() => addToCartMutation.mutate()}
          >
            {addToCartMutation.isPending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Package size={18} />
            )}
            {addToCartMutation.isPending ? 'ADDING...' : 'ADD TO BAG'}
          </Button>
          <button
            onClick={() => toggleWishlistMutation.mutate()}
            className="w-12 h-12 border border-border rounded hover:bg-secondary transition-colors flex items-center justify-center"
            disabled={toggleWishlistMutation.isPending}
          >
            <Heart 
              size={20} 
              className={wishlistData?.isWishlisted ? "fill-red-500 text-red-500" : "text-foreground"} 
            />
          </button>
        </div>
      </div>

      {/* Expandable Sections */}
      <div className="space-y-2 border-t border-border pt-4">
        <ExpandableSection title="Description">
          <p className="text-sm text-muted-foreground">{product.description}</p>
        </ExpandableSection>
        <ExpandableSection title="Product Details">
          <div className="text-sm text-muted-foreground space-y-3">
            <div>
              <p className="font-medium text-foreground mb-1">Size Details</p>
              <p>Size: {JEWELRY_SIZES.find(s => s.value === selectedSize)?.description}</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">Category</p>
              <CategoryName categoryId={product.categoryId} />
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">Product Information</p>
              <p>SKU: {product.id}</p>
            </div>
          </div>
        </ExpandableSection>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-3 gap-4 bg-secondary p-6 rounded-lg">
        <div className="text-center">
          <div className="text-2xl mb-2">🛡️</div>
          <p className="text-xs font-medium">Premium Quality</p>
        </div>
        <div className="text-center">
          <div className="text-2xl mb-2">💚</div>
          <p className="text-xs font-medium">Skin Safe Jewellery</p>
        </div>
        <div className="text-center">
          <div className="text-2xl mb-2">✨</div>
          <p className="text-xs font-medium">100% Original</p>
        </div>
      </div>

      {/* Delivery Info */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">Returns & Warranty</h3>
        </div>
        <div className="grid grid-cols-2 gap-4 text-center text-sm">
          <div className="border border-border rounded p-3">
            <div className="font-medium mb-1">30 Days</div>
            <div className="text-muted-foreground">Easy Returns</div>
          </div>
          <div className="border border-border rounded p-3">
            <div className="font-medium mb-1">1 Year</div>
            <div className="text-muted-foreground">Warranty</div>
          </div>
        </div>
      </div>
    </div>
  )
}