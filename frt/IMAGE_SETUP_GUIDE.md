# Image Setup Guide

## Hero Section Image

### Location
`frt/public/images/jewelry-hero.jpg`

### Requirements
- **Aspect Ratio**: 3:4 (e.g., 600x800px, 900x1200px)
- **Format**: JPG, PNG, or WebP
- **Size**: Optimized for web (< 500KB recommended)
- **Content**: Premium jewelry showcase image

### How to Add Your Image

1. **Save the jewelry image** you provided to:
   ```
   frt/public/images/jewelry-hero.jpg
   ```

2. **Or use a URL** from your backend/CDN:
   - If your images are hosted on Cloudinary (already configured)
   - Update the `src` in `hero-section.tsx`:
   ```typescript
   <Image
     src="https://res.cloudinary.com/your-cloud/image/upload/jewelry-hero.jpg"
     alt="Premium Jewelry Collection"
     fill
     className="object-cover object-center"
     priority
   />
   ```

### Current Setup

The hero section is configured to use:
```typescript
src="/images/jewelry-hero.jpg"
```

This will automatically look for the image in the `public/images/` folder.

## Category Images

Category images are **automatically fetched** from your product database:
- Each category displays the first product's image
- If no products exist, a beautiful gradient placeholder is shown
- Images are cached for 10 minutes for optimal performance

### How It Works

```typescript
// Fetches one product per category
const { data: productsData } = useQuery({
  queryKey: ["category-preview", category.id],
  queryFn: () => ProductAction.GetProductsAction({
    categoryId: category.id,
    isActive: true,
    limit: 1,
  }),
  staleTime: 10 * 60 * 1000,
})

const previewImage = productsData?.products[0]?.images[0]
```

## Image Optimization

### Next.js Image Component
All images use Next.js `<Image>` component for:
- Automatic optimization
- Lazy loading
- Responsive sizing
- WebP conversion
- Blur placeholder

### Allowed Domains

Currently configured in `next.config.ts`:
```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'res.cloudinary.com',
      pathname: '/**'
    }
  ]
}
```

### Adding More Domains

If you need to add more image sources:

```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'res.cloudinary.com',
      pathname: '/**'
    },
    {
      protocol: 'https',
      hostname: 'your-cdn.com',
      pathname: '/**'
    }
  ]
}
```

## Troubleshooting

### Image Not Showing?

1. **Check file location**:
   ```
   frt/public/images/jewelry-hero.jpg
   ```

2. **Check file name** (case-sensitive):
   - Must be exactly `jewelry-hero.jpg`
   - Not `Jewelry-Hero.jpg` or `jewelry_hero.jpg`

3. **Check file format**:
   - Supported: JPG, PNG, WebP, AVIF
   - Not supported: BMP, TIFF

4. **Check file size**:
   - If > 5MB, optimize it first
   - Use tools like TinyPNG or ImageOptim

5. **Clear Next.js cache**:
   ```bash
   rm -rf .next
   npm run dev
   ```

### Using External URL Instead?

Replace in `hero-section.tsx`:
```typescript
// Instead of:
src="/images/jewelry-hero.jpg"

// Use:
src="https://your-cdn.com/path/to/image.jpg"
```

Make sure the domain is added to `next.config.ts` remotePatterns.

## Best Practices

### Image Optimization
- Compress images before uploading
- Use modern formats (WebP, AVIF)
- Optimize for web (72 DPI)
- Remove EXIF data

### Naming Convention
- Use lowercase
- Use hyphens, not underscores
- Be descriptive: `jewelry-hero.jpg` not `img1.jpg`

### Folder Structure
```
public/
├── images/
│   ├── jewelry-hero.jpg      (Hero section)
│   ├── categories/           (Optional: category-specific images)
│   └── placeholders/         (Optional: fallback images)
```

## Quick Start

1. Save your jewelry image as `jewelry-hero.jpg`
2. Place it in `frt/public/images/`
3. Restart the dev server
4. Image should appear in hero section

That's it! The image will be automatically optimized by Next.js.
