"use client"

import { useState } from "react"
import { Heart, Check, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import ExpandableSection from "./expandable"

interface ProductDetailsProps {
  product: IProduct
  isWishlisted: boolean
  onWishlist: () => void
}

export default function ProductDetails({ product, isWishlisted, onWishlist }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1)
  const hasDiscount = typeof product.salePrice === "number" && product.salePrice < product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0;
  const displayPrice = product.salePrice || product.price;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            {/* Commented out until we have rating data
            <span className="text-yellow-500">★★★★★</span>
            <span className="text-sm text-muted-foreground">
              {product.rating} ({product.reviews.toLocaleString()} reviews)
            </span>
            */}
            <span className="text-sm text-muted-foreground">SKU: {product.id}</span>
          </div>
        </div>
      </div>

      {/* Price Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              MRP ₹{product.price.toLocaleString()}
            </span>
          )}
          <span className="text-2xl font-bold">₹{displayPrice.toLocaleString()}</span>
          {hasDiscount && (
            <span className="bg-primary text-primary-foreground px-2 py-1 text-sm font-bold rounded">
              SAVE {discountPercentage}%
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">Inclusive of all taxes</p>
      </div>

      {/* Stock Status */}
      <div className="flex items-center gap-2 text-sm">
        {product.isActive && product.stock > 0 ? (
          <>
            <Check className="text-green-600" size={18} />
            <span>In stock - {product.stock} units available</span>
          </>
        ) : (
          <span className="text-destructive">Currently unavailable</span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <Button 
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-12 gap-2"
            disabled={!product.isActive || product.stock === 0}
          >
            <Package size={18} />
            ADD TO BAG
          </Button>
          <button
            onClick={onWishlist}
            className="w-12 h-12 border border-border rounded hover:bg-secondary transition-colors flex items-center justify-center"
          >
            <Heart size={20} className={isWishlisted ? "fill-red-500 text-red-500" : "text-foreground"} />
          </button>
        </div>
        <Button 
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12"
          disabled={!product.isActive || product.stock === 0}
        >
          BUY IT NOW
        </Button>
      </div>

      {/* Expandable Sections */}
      <div className="space-y-2 border-t border-border pt-4">
        <ExpandableSection title="Description">
          <p className="text-sm text-muted-foreground">{product.description}</p>
        </ExpandableSection>
        <ExpandableSection title="Product Details">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>Category ID: {product.categoryId}</p>
            <p>Size: {product.jewelrySize}</p>
          </div>
        </ExpandableSection>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-3 gap-4 bg-secondary p-6 rounded-lg">
        <div className="text-center">
          <div className="text-2xl mb-2">🛡️</div>
          <p className="text-xs font-medium">Premium Quality</p>
        </div>
        <div className="text-center">
          <div className="text-2xl mb-2">💚</div>
          <p className="text-xs font-medium">Quality Assurance</p>
        </div>
        <div className="text-center">
          <div className="text-2xl mb-2">✨</div>
          <p className="text-xs font-medium">100% Original</p>
        </div>
      </div>

      {/* Delivery Info */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">Returns & Delivery</h3>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div className="border border-border rounded p-3">
            <div className="text-lg mb-1">📦</div>
            <p className="font-medium">Free Delivery</p>
          </div>
          <div className="border border-border rounded p-3">
            <div className="text-lg mb-1">🔄</div>
            <p className="font-medium">Easy Returns</p>
          </div>
          <div className="border border-border rounded p-3">
            <div className="text-lg mb-1">💳</div>
            <p className="font-medium">Secure Payment</p>
          </div>
        </div>
      </div>
    </div>
  )
}
