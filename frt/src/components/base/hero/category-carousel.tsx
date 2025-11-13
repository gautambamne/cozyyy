"use client"

import { useActiveCategories } from "@/hooks/use-categories"
import { useQuery } from "@tanstack/react-query"
import { ProductAction } from "@/api-actions/product-actions"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "motion/react"
import Link from "next/link"
import { Sparkles } from "lucide-react"
import Image from "next/image"

export function CategoryCarousel() {
  const { data, isLoading, error } = useActiveCategories()

  if (error) {
    return (
      <section className="py-16 px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center text-destructive">
            <p>Failed to load categories</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="categories" className="relative py-24 px-6 lg:px-8 bg-linear-to-b from-white via-amber-50/30 to-white dark:from-neutral-950 dark:via-amber-950/10 dark:to-neutral-950 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(251,191,36,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(251,191,36,0.05),transparent_50%)]" />
      
      <div className="relative mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <p className="text-sm font-medium tracking-[0.2em] uppercase text-amber-700 dark:text-amber-400">
              Shop by Category
            </p>
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-4xl md:text-5xl font-light tracking-tight text-neutral-900 dark:text-neutral-50 mb-4">
            Explore Our Collections
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Discover handcrafted jewelry pieces across our curated categories
          </p>
        </motion.div>

        {/* Carousel */}
        {isLoading ? (
          <div className="flex justify-center gap-8 flex-wrap">
            {[...Array(4)].map((_, i) => (
              <CategoryCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <Carousel
            opts={{
              align: "center",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-6">
              {data?.categories.map((category: ICategory, index: number) => (
                <CarouselItem
                  key={category.id}
                  className="pl-6 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/5"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  >
                    <CategoryCard category={category} index={index} />
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="hidden md:block">
              <CarouselPrevious className="-left-4 lg:-left-12 bg-white dark:bg-neutral-900 border-2 hover:bg-amber-50 dark:hover:bg-amber-950/20" />
              <CarouselNext className="-right-4 lg:-right-12 bg-white dark:bg-neutral-900 border-2 hover:bg-amber-50 dark:hover:bg-amber-950/20" />
            </div>
          </Carousel>
        )}


      </div>
    </section>
  )
}

function CategoryCard({ category, index }: { category: ICategory; index: number }) {
  // Fetch one product from this category to get an image
  const { data: productsData, isLoading: imageLoading } = useQuery({
    queryKey: ["category-preview", category.id],
    queryFn: () =>
      ProductAction.GetProductsAction({
        categoryId: category.id,
        isActive: true,
        limit: 1,
      }),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes cache
  })

  const previewImage = productsData?.products[0]?.images[0]
  const productCount = productsData?.pagination?.total || 0

  // Gradient colors for variety
  const gradients = [
    "from-amber-400 to-orange-500",
    "from-rose-400 to-pink-500",
    "from-violet-400 to-purple-500",
    "from-blue-400 to-cyan-500",
    "from-emerald-400 to-teal-500",
  ]
  const gradient = gradients[index % gradients.length]

  return (
    <Link href={`/categories/${category.slug}`} className="block">
      <div className="flex flex-col items-center cursor-pointer">
        {/* Circular Image Container - Simplified */}
        <div className="relative mb-4 flex items-center justify-center">
          <div className="relative w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full border-4 border-white dark:border-neutral-950 shadow-lg">
            <div className="relative h-full w-full overflow-hidden rounded-full bg-linear-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900">
              {imageLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full border-4 border-amber-400/30 border-t-amber-600 animate-spin" />
                </div>
              ) : previewImage ? (
                <Image
                  src={previewImage}
                  alt={category.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 128px, 160px"
                  priority={false}
                  loading="lazy"
                  quality={85}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`w-16 h-16 rounded-full bg-linear-to-br ${gradient} flex items-center justify-center shadow-lg`}>
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Category Name - Simplified */}
        <div className="text-center space-y-1">
          <h3 className="font-semibold text-base text-neutral-900 dark:text-neutral-50">
            {category.name}
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            {productCount > 0 ? `${productCount} items` : 'Explore'}
          </p>
        </div>
      </div>
    </Link>
  )
}

function CategoryCardSkeleton() {
  return (
    <div className="flex flex-col items-center animate-pulse">
      <div className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full bg-linear-to-br from-neutral-200 to-neutral-300 dark:from-neutral-800 dark:to-neutral-700 mb-4 border-4 border-white dark:border-neutral-950 shadow-xl" />
      <div className="space-y-2 text-center">
        <Skeleton className="h-5 w-24 mx-auto" />
        <Skeleton className="h-3 w-16 mx-auto" />
      </div>
    </div>
  )
}
