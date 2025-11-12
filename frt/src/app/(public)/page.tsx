import { HeroSection, CategoryCarousel, FeaturedProducts, NewsletterSection } from "@/components/base/hero"

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <CategoryCarousel />
      <FeaturedProducts />
      <NewsletterSection />
    </main>
  )
}
