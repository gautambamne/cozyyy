# Hero Section Components

Luxury jewelry and accessories hero UI components inspired by Pomellato's design aesthetic.

## Components

### HeroSection
Main hero banner with animated content, CTA buttons, and decorative elements.

**Features:**
- Smooth fade-in animations using Framer Motion
- Gradient background with decorative patterns
- Responsive layout with stats display
- Scroll indicator animation

### CategoryCarousel
Interactive carousel showcasing product categories with hover effects.

**Features:**
- Uses TanStack Query for data fetching with `useActiveCategories` hook
- Embla Carousel for smooth scrolling
- Staggered animation on scroll into view
- Responsive grid fallback on mobile
- Optimized caching (5min stale time, 10min cache)

**API Integration:**
```typescript
const { data, isLoading, error } = useActiveCategories()
```

### FeaturedProducts
Grid display of featured products with lazy loading.

**Features:**
- TanStack Query integration with `useProducts` hook
- Animated product cards on scroll
- Responsive grid layout (1-2-4 columns)
- Loading skeletons for better UX

**API Integration:**
```typescript
const { data, isLoading, error } = useProducts({
  isActive: true,
  limit: 8,
})
```

## Usage

```tsx
import { HeroSection, CategoryCarousel, FeaturedProducts } from "@/components/base/hero"

export default function Home() {
  return (
    <main>
      <HeroSection />
      <CategoryCarousel />
      <FeaturedProducts />
    </main>
  )
}
```

## Best Practices Implemented

1. **TanStack Query Integration**
   - Proper query key management
   - Optimized stale time and cache time
   - Error handling
   - Loading states

2. **Performance**
   - Lazy loading with viewport detection
   - Optimized re-renders with proper memoization
   - Efficient carousel implementation

3. **Accessibility**
   - Semantic HTML structure
   - ARIA labels for carousel controls
   - Keyboard navigation support
   - Screen reader friendly

4. **Responsive Design**
   - Mobile-first approach
   - Breakpoint-based layouts
   - Touch-friendly interactions

5. **Animation**
   - Smooth transitions with Framer Motion
   - Staggered animations for better visual flow
   - Reduced motion support (respects user preferences)

## Customization

### Colors
The components use Tailwind CSS classes with neutral and amber color schemes. Modify in the component files or extend your Tailwind config.

### Animation Timing
Adjust animation delays and durations in the `motion.div` components:
```tsx
transition={{ delay: 0.5, duration: 0.6 }}
```

### Carousel Settings
Modify carousel behavior in the `opts` prop:
```tsx
opts={{
  align: "start",
  loop: true,
}}
```
