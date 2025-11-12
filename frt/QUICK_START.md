# Quick Start Guide - Hero UI

## What Was Built

A complete luxury jewelry homepage with:
- ✅ Hero banner with animations
- ✅ Category carousel with TanStack Query
- ✅ Featured products grid
- ✅ Newsletter subscription section
- ✅ Full responsive design
- ✅ Dark mode support
- ✅ Loading states & error handling

## Run the Project

```bash
cd frt
npm run dev
# or
bun dev
```

Visit: `http://localhost:3000`

## API Requirements

Ensure your backend is running at the URL specified in `.env`:

```env
NEXT_PUBLIC_BACKEND_URL="http://localhost:5000/api/v1"
```

### Required API Endpoints

1. **GET /categories/active** - Returns active categories
2. **GET /products?isActive=true&limit=8** - Returns featured products

## Component Structure

```
Homepage Flow:
┌─────────────────────────────────┐
│      HeroSection                │  <- Main banner with CTA
├─────────────────────────────────┤
│   CategoryCarousel              │  <- Scrollable categories
├─────────────────────────────────┤
│   FeaturedProducts              │  <- Product grid (8 items)
├─────────────────────────────────┤
│   NewsletterSection             │  <- Email subscription
└─────────────────────────────────┘
```

## Key Features

### TanStack Query Integration
- Automatic caching (5min stale, 10min cache)
- Optimistic updates
- Error handling
- Loading states

### Animations
- Framer Motion for smooth transitions
- Scroll-triggered animations
- Staggered effects
- Hover interactions

### Responsive Design
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 4 columns
- Touch-friendly carousel

## Customization

### Colors
Edit in component files or Tailwind config:
- Primary: `neutral-900` / `neutral-50`
- Accent: `amber-400` to `amber-700`

### Content
Update text in component files:
- Hero title: `hero-section.tsx`
- Section headings: Each component file

### API Limits
Change product/category limits:
```typescript
// In featured-products.tsx
useProducts({ isActive: true, limit: 8 })
```

## Troubleshooting

### Categories not showing?
- Check backend is running
- Verify API endpoint: `/categories/active`
- Check browser console for errors

### Products not loading?
- Verify backend connection
- Check API endpoint: `/products`
- Ensure products have `isActive: true`

### Animations not working?
- Ensure Framer Motion is installed
- Check browser supports animations
- Verify no CSS conflicts

## Next Steps

1. Add real product images
2. Implement category filtering
3. Add product detail pages
4. Connect newsletter API
5. Add shopping cart integration
6. Implement wishlist feature
