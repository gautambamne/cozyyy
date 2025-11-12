"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useProducts } from "@/hooks/use-products"
import { useActiveCategories } from "@/hooks/use-categories"
import { ProductCard } from "@/components/base/product-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { motion } from "motion/react"
import { ArrowLeft, SlidersHorizontal } from "lucide-react"
import Link from "next/link"

export default function CategoryPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  
  const { data: categoriesData } = useActiveCategories()
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [categoryName, setCategoryName] = useState<string>("")

  // Find category by slug
  useEffect(() => {
    if (categoriesData?.categories) {
      const category = categoriesData.categories.find(
        (cat: ICategory) => cat.slug === slug
      )
      if (category) {
        setCategoryId(category.id)
        setCategoryName(category.name)
      }
    }
  }, [categoriesData, slug])

  const { data, isLoading, error } = useProducts({
    categoryId: categoryId || undefined,
    isActive: true,
    limit: 20,
  })

  if (error) {
    return (
      <main className="min-h-screen bg-background pt-24 px-6 lg:px-8 pb-16">
        <div className="mx-auto max-w-7xl">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-destructive mb-2">
              Error Loading Products
            </h2>
            <p className="text-muted-foreground mb-6">
              {error instanceof Error ? error.message : "Something went wrong"}
            </p>
            <Button asChild variant="outline">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-900 pt-24 px-6 lg:px-8 pb-16">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumb & Back Button */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            <Link href="/" className="hover:text-neutral-900 dark:hover:text-neutral-50">
              Home
            </Link>
            <span>/</span>
            <Link href="/#categories" className="hover:text-neutral-900 dark:hover:text-neutral-50">
              Categories
            </Link>
            <span>/</span>
            <span className="text-neutral-900 dark:text-neutral-50 font-medium">
              {categoryName || slug}
            </span>
          </div>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-sm font-medium tracking-[0.2em] uppercase text-amber-700 dark:text-amber-400 mb-3">
                Collection
              </p>
              <h1 className="text-4xl md:text-5xl font-light tracking-tight text-neutral-900 dark:text-neutral-50">
                {categoryName || slug}
              </h1>
            </div>
            
            {!isLoading && data && (
              <p className="text-neutral-600 dark:text-neutral-400">
                {data.products.length} {data.products.length === 1 ? "product" : "products"}
              </p>
            )}
          </div>

          {/* Filters Bar */}
          <div className="flex items-center justify-between py-4 border-y border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">Sort by:</span>
              <select className="text-sm border border-neutral-200 dark:border-neutral-800 rounded-md px-3 py-1.5 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50">
                <option>Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : data?.products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-neutral-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-neutral-900 dark:text-neutral-50 mb-2">
              No products found
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              We couldn't find any products in this category yet.
            </p>
            <Button asChild>
              <Link href="/">Browse All Products</Link>
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data?.products.map((product: IProduct, index: number) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.5 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Load More */}
        {data && data.products.length > 0 && data.pagination.totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-12 text-center"
          >
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              Showing {data.products.length} of {data.pagination.total} products
            </p>
            <Button variant="outline" size="lg">
              Load More
            </Button>
          </motion.div>
        )}
      </div>
    </main>
  )
}

function ProductCardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="aspect-square w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-6 w-1/3" />
      </div>
    </div>
  )
}
