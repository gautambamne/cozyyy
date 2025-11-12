"use client"

import { useState } from "react"
import { useProducts } from "@/hooks/use-products"
import { useActiveCategories } from "@/hooks/use-categories"
import { ProductCard } from "@/components/base/product-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { motion } from "motion/react"
import { SlidersHorizontal, X, Grid3x3, LayoutGrid } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()
  const [sortBy, setSortBy] = useState<"createdAt" | "price">("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [gridCols, setGridCols] = useState<3 | 4>(4)

  const { data: categoriesData } = useActiveCategories()
  const { data, isLoading, error } = useProducts({
    categoryId: selectedCategory,
    isActive: true,
    sortBy,
    sortOrder,
    limit: 20,
  })

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId === selectedCategory ? undefined : categoryId)
  }

  const handleSortChange = (value: string) => {
    const [newSortBy, newSortOrder] = value.split("-") as ["createdAt" | "price", "asc" | "desc"]
    setSortBy(newSortBy)
    setSortOrder(newSortOrder)
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background pt-24 px-6 lg:px-8 pb-16">
        <div className="mx-auto max-w-7xl">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-destructive mb-2">
              Error Loading Products
            </h2>
            <p className="text-muted-foreground">
              {error instanceof Error ? error.message : "Something went wrong"}
            </p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-900 pt-24 px-6 lg:px-8 pb-16">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <p className="text-sm font-medium tracking-[0.2em] uppercase text-amber-700 dark:text-amber-400 mb-3">
            Shop
          </p>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-neutral-900 dark:text-neutral-50 mb-4">
            All Products
          </h1>
          {!isLoading && data && (
            <p className="text-neutral-600 dark:text-neutral-400">
              {data.products.length} of {data.pagination.total} products
            </p>
          )}
        </motion.div>

        <div className="flex gap-8">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Categories Filter */}
              <div>
                <h3 className="font-medium text-neutral-900 dark:text-neutral-50 mb-4">
                  Categories
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="all-categories"
                      checked={!selectedCategory}
                      onCheckedChange={() => setSelectedCategory(undefined)}
                    />
                    <Label
                      htmlFor="all-categories"
                      className="text-sm font-normal cursor-pointer"
                    >
                      All Categories
                    </Label>
                  </div>
                  {categoriesData?.categories.map((category: ICategory) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={category.id}
                        checked={selectedCategory === category.id}
                        onCheckedChange={() => handleCategoryChange(category.id)}
                      />
                      <Label
                        htmlFor={category.id}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {category.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sort Filter */}
              <div>
                <h3 className="font-medium text-neutral-900 dark:text-neutral-50 mb-4">
                  Sort By
                </h3>
                <RadioGroup
                  value={`${sortBy}-${sortOrder}`}
                  onValueChange={handleSortChange}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="createdAt-desc" id="newest" />
                    <Label htmlFor="newest" className="text-sm font-normal cursor-pointer">
                      Newest First
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="price-asc" id="price-low" />
                    <Label htmlFor="price-low" className="text-sm font-normal cursor-pointer">
                      Price: Low to High
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="price-desc" id="price-high" />
                    <Label htmlFor="price-high" className="text-sm font-normal cursor-pointer">
                      Price: High to Low
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Active Filters */}
              {selectedCategory && (
                <div>
                  <h3 className="font-medium text-neutral-900 dark:text-neutral-50 mb-4">
                    Active Filters
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedCategory(undefined)}
                      className="gap-2"
                    >
                      {categoriesData?.categories.find((c: ICategory) => c.id === selectedCategory)?.name}
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filters & View Toggle */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-200 dark:border-neutral-800">
              {/* Mobile Filter Sheet */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden gap-2">
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    {/* Mobile Categories */}
                    <div>
                      <h3 className="font-medium mb-4">Categories</h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="mobile-all"
                            checked={!selectedCategory}
                            onCheckedChange={() => setSelectedCategory(undefined)}
                          />
                          <Label htmlFor="mobile-all" className="text-sm font-normal">
                            All Categories
                          </Label>
                        </div>
                        {categoriesData?.categories.map((category: ICategory) => (
                          <div key={category.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`mobile-${category.id}`}
                              checked={selectedCategory === category.id}
                              onCheckedChange={() => handleCategoryChange(category.id)}
                            />
                            <Label htmlFor={`mobile-${category.id}`} className="text-sm font-normal">
                              {category.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mobile Sort */}
                    <div>
                      <h3 className="font-medium mb-4">Sort By</h3>
                      <RadioGroup
                        value={`${sortBy}-${sortOrder}`}
                        onValueChange={handleSortChange}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="createdAt-desc" id="mobile-newest" />
                          <Label htmlFor="mobile-newest" className="text-sm font-normal">
                            Newest First
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="price-asc" id="mobile-price-low" />
                          <Label htmlFor="mobile-price-low" className="text-sm font-normal">
                            Price: Low to High
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="price-desc" id="mobile-price-high" />
                          <Label htmlFor="mobile-price-high" className="text-sm font-normal">
                            Price: High to Low
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {/* View Toggle */}
              <div className="flex items-center gap-2">
                <Button
                  variant={gridCols === 3 ? "default" : "outline"}
                  size="icon-sm"
                  onClick={() => setGridCols(3)}
                  className="hidden sm:flex"
                >
                  <Grid3x3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={gridCols === 4 ? "default" : "outline"}
                  size="icon-sm"
                  onClick={() => setGridCols(4)}
                  className="hidden sm:flex"
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className={`grid grid-cols-1 sm:grid-cols-2 ${gridCols === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6`}>
                {[...Array(12)].map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : data?.products.length === 0 ? (
              <div className="text-center py-16">
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
                  Try adjusting your filters
                </p>
                <Button onClick={() => setSelectedCategory(undefined)}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className={`grid grid-cols-1 sm:grid-cols-2 ${gridCols === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6`}>
                {data?.products.map((product: IProduct, index: number) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03, duration: 0.4 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
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
