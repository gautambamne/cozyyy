"use client"

import { useParams } from "next/navigation"
import ProductDetails from "./product-details"
import { useProduct } from "@/hooks/use-products"
import { useWishlist } from "@/hooks/use-wishlist"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function ProductPage() {
  const { product_id } = useParams();
  const { data: product, isLoading, error } = useProduct(product_id as string);
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 pt-24 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-[500px] w-full" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background pt-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-destructive mb-2">Error loading product</h2>
            <p className="text-muted-foreground">{(error as Error).message}</p>
          </div>
        </div>
      </main>
    );
  }

  if (!product?.product) {
    return (
      <main className="min-h-screen bg-background pt-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Product not found</h2>
            <p className="text-muted-foreground">The product you're looking for doesn't exist.</p>
          </div>
        </div>
      </main>
    );
  }

  const productData = product.product;

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="sticky top-8 h-fit space-y-4">
            <div className="aspect-square relative rounded-lg overflow-hidden border border-border group">
              {productData.images.length > 0 && (
                <>
                  <img
                    src={productData.images[currentImageIndex || 0]}
                    alt={productData.name}
                    className="object-contain w-full h-full"
                  />
                  {productData.images.length > 1 && (
                    <>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : productData.images.length - 1))}
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setCurrentImageIndex((prev) => (prev < productData.images.length - 1 ? prev + 1 : 0))}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>
            <div className="grid grid-cols-4 gap-4">
              {productData.images.map((image: string, index: number) => (
                <div 
                  key={index} 
                  className={`aspect-square relative rounded-lg overflow-hidden border cursor-pointer transition-all ${
                    currentImageIndex === index ? 'border-primary' : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <img
                    src={image}
                    alt={`${productData.name} view ${index + 1}`}
                    className="object-contain w-full h-full"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div>
            <ProductDetails
              product={productData}
              isWishlisted={isWishlisted(productData.id)}
              onWishlist={() => toggleWishlist(productData.id)}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
