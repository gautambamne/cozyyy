"use client"

import { ProductCard } from "@/components/base/product-card"
import { useProducts } from "@/hooks/use-products"
import { Loader2 } from "lucide-react"

export default function Home() {
  const { data, isLoading, error } = useProducts({
    isActive: true,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc'
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
            <h2 className="text-2xl font-bold text-destructive mb-2">Error Loading Products</h2>
            <p className="text-muted-foreground">
              {error instanceof Error ? error.message : 'Something went wrong'}
            </p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background pt-24 px-8 pb-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">
            Showing {data?.products.length} of {data?.pagination.total} products
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {data?.products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      </div>
    </main>
  )
}
