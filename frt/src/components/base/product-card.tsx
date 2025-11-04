'use client'
import * as React from "react";
import Image from "next/image";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps extends React.HTMLAttributes<HTMLDivElement> {
  product: IProduct;
}

const ProductCard = React.forwardRef<HTMLDivElement, ProductCardProps>(
  ({ product, className, ...props }, ref) => {
    const [quantity, setQuantity] = React.useState(1);
    const [selectedSize, setSelectedSize] = React.useState<string>(product.jewelrySize);
    const [isImageLoading, setIsImageLoading] = React.useState(true);
    const [isAddingToCart, setIsAddingToCart] = React.useState(false);

    const { toast } = useToast();

    const isOutOfStock = !product.isActive || product.stock === 0;
    const isLowStock = product.isActive && product.stock < 20;
    const mainImage = React.useMemo(() => product.images[0], [product.images]);

    // Calculate discount percentage
    const discountPercentage = product.salePrice
      ? Math.round(((product.salePrice - product.price) / product.salePrice) * 100)
      : 0;

    // Event handlers
    const handleQuantityChange = React.useCallback(
      (delta: number) => {
        if (isOutOfStock) return;
        setQuantity((prev) => {
          const newQuantity = prev + delta;
          return Math.min(Math.max(1, newQuantity), product.stock);
        });
      },
      [isOutOfStock, product.stock]
    );

    const handleSizeChange = React.useCallback((value: string) => {
      setSelectedSize(value);
    }, []);

    const handleAddToCart = React.useCallback(async () => {
      if (isOutOfStock || isAddingToCart) return;
      try {
        setIsAddingToCart(true);
        await new Promise((resolve) => setTimeout(resolve, 500));
        toast({
          description: `${quantity}x ${product.name} (${selectedSize}) added to your cart`,
        });
      } catch (err) {
        toast({
          description: `Failed to add ${product.name} to cart`,
        });
      } finally {
        setIsAddingToCart(false);
      }
    }, [product, quantity, selectedSize, isOutOfStock, isAddingToCart, toast]);

    return (
      <Card
        ref={ref}
        className={cn(
          "group overflow-hidden rounded-2xl shadow-xl border border-border bg-background text-foreground transition-all hover:border-primary",
          "dark:bg-[#18181b] dark:text-white",
          className
        )}
        {...props}
      >
        {/* Product Image Section */}
        <div className="relative aspect-square overflow-hidden bg-muted/30 rounded-t-xl">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className={cn(
              "object-cover transition-all duration-500",
              isImageLoading ? "scale-110 blur-sm" : "scale-100 blur-0",
              !isOutOfStock && "group-hover:scale-105"
            )}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={false}
            onLoadingComplete={() => setIsImageLoading(false)}
          />
          {/* Discount/Stock Badge */}
          <div className="absolute top-3 left-3 flex items-start gap-2 z-10">
            {discountPercentage > 0 && !isOutOfStock && (
              <Badge className="bg-green-600 text-white font-semibold shadow-lg">
                {discountPercentage}% OFF
              </Badge>
            )}
            {isOutOfStock && (
              <Badge variant="destructive" className="font-semibold shadow-lg">
                Out of Stock
              </Badge>
            )}
          </div>
        </div>

        {/* Product Details */}
        <CardContent className="p-4 space-y-3">
          {/* Product Name */}
          <h3 className="font-medium text-base leading-tight line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>

          {/* Price Section */}
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-xl font-bold text-foreground dark:text-white">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
            {product.salePrice && (
              <span className="text-sm text-muted-foreground line-through">
                ₹{product.salePrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>

          {/* Size Selector */}
          <Select
            value={selectedSize}
            onValueChange={handleSizeChange}
            disabled={isOutOfStock}
          >
            <SelectTrigger className="w-full h-10 bg-background dark:bg-[#222] border border-muted rounded-md font-medium">
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent className="bg-background dark:bg-[#222] rounded-md">
              <SelectGroup>
                {["SMALL", "MEDIUM", "LARGE", "EXTRA_LARGE", "CUSTOM"].map((size) => (
                  <SelectItem key={size} value={size}>
                    {size.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* Quantity Control */}
          <div className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2 mt-1">
            <span className="text-sm font-medium text-muted-foreground">Qty:</span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-md hover:bg-background"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1 || isOutOfStock}
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-base font-semibold w-8 text-center" role="status">
                {quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-md hover:bg-background"
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= product.stock || isOutOfStock}
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Stock Warning */}
          {isLowStock && (
            <p className="text-xs text-orange-600 dark:text-orange-400 font-medium ml-1" role="alert">
              Only {product.stock} left in stock
            </p>
          )}
        </CardContent>

        {/* Add to Cart Button (at the bottom) */}
        <CardFooter className="p-4 pt-0">
          <Button
            className="w-full h-11 font-semibold rounded-lg bg-muted text-foreground dark:bg-[#222] dark:text-white hover:bg-primary/80 hover:text-white"
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAddingToCart}
          >
            <ShoppingCart className="mr-2 h-5 w-5" aria-hidden="true" />
            {isOutOfStock
              ? "Out of Stock"
              : isAddingToCart
              ? "Adding..."
              : "Add to Cart"}
          </Button>
        </CardFooter>
      </Card>
    );
  }
);

ProductCard.displayName = "ProductCard";
export { ProductCard };
