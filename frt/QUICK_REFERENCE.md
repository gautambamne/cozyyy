# Quick Reference - Category & Products Implementation

## 🚀 Quick Start

```bash
cd frt
npm run dev
# Visit http://localhost:3000
```

## 📍 Routes

| Route | Description |
|-------|-------------|
| `/` | Homepage with hero, categories, featured products |
| `/categories/[slug]` | Category-specific products page |
| `/products` | All products with advanced filters |
| `/product/[id]` | Individual product details |

## 🎯 Key Features

### Homepage (`/`)
- ✅ Hero banner with animations
- ✅ Category carousel with product images
- ✅ Featured products grid (8 items)
- ✅ Newsletter subscription

### Category Page (`/categories/[slug]`)
- ✅ Breadcrumb navigation
- ✅ Filtered products by category
- ✅ Sort options
- ✅ Responsive grid (1-2-4 cols)
- ✅ Empty state handling

### Products Page (`/products`)
- ✅ Sidebar filters (desktop)
- ✅ Sheet filters (mobile)
- ✅ Category checkboxes
- ✅ Sort by price/date
- ✅ Grid view toggle (3/4 cols)
- ✅ Active filters display

## 🎨 Component Structure

```
HomePage
├── HeroSection
├── CategoryCarousel
│   └── CategoryCard (with dynamic images)
├── FeaturedProducts
│   └── ProductCard
└── NewsletterSection

CategoryPage
├── Breadcrumb
├── Header
├── FilterBar
└── ProductGrid
    └── ProductCard

ProductsPage
├── Header
├── Sidebar (desktop)
│   ├── Category Filters
│   ├── Sort Options
│   └── Active Filters
├── Sheet (mobile)
└── ProductGrid
    └── ProductCard
```

## 🔧 API Hooks

```typescript
// Get active categories
const { data } = useActiveCategories()

// Get products with filters
const { data } = useProducts({
  categoryId: "uuid",
  isActive: true,
  sortBy: "price" | "createdAt",
  sortOrder: "asc" | "desc",
  limit: 20,
})

// Get category preview image
const { data } = useQuery({
  queryKey: ["category-preview", categoryId],
  queryFn: () => ProductAction.GetProductsAction({
    categoryId,
    isActive: true,
    limit: 1,
  }),
})
```

## 🎨 Styling Classes

### Category Card Hover
```typescript
className="group hover:border-amber-400 hover:shadow-xl"
// Image: group-hover:scale-110
// Overlay: group-hover:opacity-80
```

### Grid Layouts
```typescript
// Mobile: grid-cols-1
// Tablet: sm:grid-cols-2
// Desktop: lg:grid-cols-4 (or lg:grid-cols-3)
```

### Animations
```typescript
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: index * 0.05, duration: 0.5 }}
```

## 📱 Responsive Breakpoints

```css
/* Mobile */
< 640px: 1 column, sheet filters

/* Tablet */
640px - 1024px: 2 columns

/* Desktop */
> 1024px: 3-4 columns, sidebar filters
```

## 🎯 User Actions

### Browse Categories
1. Scroll to "Shop by Category"
2. Click category card
3. View filtered products
4. Click product for details

### Filter Products
1. Go to `/products`
2. Select category checkbox
3. Choose sort option
4. Toggle grid view
5. Clear filters if needed

### Mobile Filtering
1. Tap "Filters" button
2. Sheet drawer opens
3. Select filters
4. Close drawer
5. View results

## 🔍 Data Management

### Caching Strategy
```typescript
// Category previews: 10 minutes
staleTime: 10 * 60 * 1000

// Active categories: 5 minutes stale, 10 minutes cache
staleTime: 5 * 60 * 1000
gcTime: 10 * 60 * 1000
```

### Query Keys
```typescript
["categories", "active"]
["category-preview", categoryId]
["products", "list", { params }]
```

## 🎨 Color Palette

```typescript
// Primary
neutral-900 (dark)
neutral-50 (light)

// Accent
amber-400 to amber-700

// Backgrounds
neutral-50 (light mode)
neutral-900 (dark mode)

// Gradients
from-amber-50 via-neutral-50 to-amber-50
```

## ⚡ Performance Tips

1. **Images**: Use Next.js Image with proper sizes
2. **Caching**: Leverage TanStack Query cache
3. **Animations**: Use GPU-accelerated transforms
4. **Loading**: Show skeletons during fetch
5. **Lazy Load**: Viewport detection for animations

## 🐛 Troubleshooting

### Images not loading?
- Check backend URL in `.env`
- Verify product has images array
- Check Next.js image domains config

### Categories not showing?
- Verify `/categories/active` endpoint
- Check backend is running
- Look for console errors

### Filters not working?
- Check query params in URL
- Verify API supports filtering
- Check TanStack Query devtools

## 📦 Dependencies Used

```json
{
  "@tanstack/react-query": "^5.90.5",
  "motion": "^12.23.24",
  "embla-carousel-react": "^8.6.0",
  "next": "16.0.0",
  "react": "19.2.0"
}
```

## ✅ Testing Checklist

- [ ] Homepage loads with all sections
- [ ] Category images display correctly
- [ ] Category click navigates to filtered page
- [ ] Products page filters work
- [ ] Mobile filters sheet opens
- [ ] Grid toggle changes layout
- [ ] Sort options update results
- [ ] Empty states show properly
- [ ] Loading skeletons appear
- [ ] Dark mode works
- [ ] Responsive on mobile/tablet/desktop

## 🎉 Success Metrics

✅ Dynamic category images
✅ Interactive filtering
✅ Smooth animations
✅ Responsive design
✅ Optimized performance
✅ Professional UI/UX
✅ Type-safe code
✅ Best practices followed
