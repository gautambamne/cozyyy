"use client"

import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export function HeroSection() {
  return (
    <section className="relative h-[85vh] min-h-[600px] w-full overflow-hidden bg-gradient-to-br from-neutral-50 via-amber-50/30 to-neutral-100 dark:from-neutral-950 dark:via-amber-950/20 dark:to-neutral-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(217,179,140,0.1),transparent_50%)]" />
      
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8 h-full flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-sm font-medium tracking-[0.2em] uppercase text-amber-700 dark:text-amber-400"
              >
                New Collection
              </motion.p>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-neutral-900 dark:text-neutral-50"
              >
                Timeless
                <span className="block font-serif italic text-amber-800 dark:text-amber-400">
                  Elegance
                </span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-lg text-neutral-600 dark:text-neutral-400 max-w-lg leading-relaxed"
              >
                Discover our exquisite collection of handcrafted jewelry and accessories, 
                where artistry meets sophistication.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              <Button
                asChild
                size="lg"
                className="bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-50 dark:hover:bg-neutral-200 dark:text-neutral-900 text-white px-8 h-12 text-base group"
              >
                <Link href="#categories">
                  Explore Collection
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-neutral-300 dark:border-neutral-700 px-8 h-12 text-base"
              >
                <Link href="#featured">
                  View Featured
                </Link>
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="flex gap-8 pt-8 border-t border-neutral-200 dark:border-neutral-800"
            >
              <div>
                <p className="text-2xl font-light text-neutral-900 dark:text-neutral-50">500+</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Unique Pieces</p>
              </div>
              <div>
                <p className="text-2xl font-light text-neutral-900 dark:text-neutral-50">100%</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Handcrafted</p>
              </div>
              <div>
                <p className="text-2xl font-light text-neutral-900 dark:text-neutral-50">24/7</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Support</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
            className="relative hidden lg:block"
          >
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-rose-100 via-neutral-100 to-amber-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-amber-950/30">
              {/* Premium Jewelry Image - Using Next.js Image */}
              <Image
                src="/jewelry-hero.jpg"
                alt="Premium Jewelry Collection"
                fill
                className="object-cover object-center"
                priority
                onError={() => {
                  console.log("Image failed to load, showing fallback")
                }}
              />

              {/* Elegant Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              
              {/* Jewelry Badge */}
              <div className="absolute bottom-8 left-8 right-8">
                <div className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md rounded-xl p-6 shadow-2xl border border-white/20">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <p className="text-xs font-medium tracking-[0.2em] uppercase text-amber-700 dark:text-amber-400">
                      Featured Collection
                    </p>
                  </div>
                  <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-50">
                    Premium Jewelry
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    Handcrafted Excellence
                  </p>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-amber-400/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-rose-400/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 -right-8 w-24 h-24 bg-amber-600/10 rounded-full blur-2xl" />
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs text-neutral-500 dark:text-neutral-400 tracking-wider">SCROLL</p>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-px h-12 bg-gradient-to-b from-neutral-400 to-transparent"
          />
        </div>
      </motion.div>
    </section>
  )
}
