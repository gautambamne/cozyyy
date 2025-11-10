import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import * as ProductAction from "@/api-actions/product-actions";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProductDetailsDrawerProps {
  productId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDetailsDrawer({ productId, isOpen, onClose }: ProductDetailsDrawerProps) {
  // Fetch product details using TanStack Query
  const { data: productDetails, isLoading } = useQuery<IGetProductByIdResponse>({
    queryKey: ['productDetails', productId],
    queryFn: async () => {
      return await ProductAction.ProductAction.GetProductByIdAction({ id: productId });
    },
    enabled: isOpen && !!productId, // Only fetch when drawer is open and productId exists
  });

  const getStockStatusColor = (stock: number) => {
    if (stock === 0) {
      return 'bg-red-100 text-red-600';
    } else if (stock < 10) {
      return 'bg-yellow-100 text-yellow-600';
    } else {
      return 'bg-green-100 text-green-600';
    }
  };

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader className="px-6">
          <SheetTitle>Product Details</SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center h-[80vh] px-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : productDetails?.product ? (
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="space-y-6 py-6 px-6">
              {/* Product Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{productDetails.product.name}</h3>
                  <Badge 
                    variant="secondary" 
                    className={cn("px-2 py-1", getStockStatusColor(productDetails.product.stock))}
                  >
                    {productDetails.product.stock === 0 ? 'Out of Stock' : `In Stock: ${productDetails.product.stock}`}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Category ID: {productDetails.product.categoryId}
                </p>
              </div>

              <Separator />

              {/* Product Images */}
              {productDetails.product.images.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3">Product Images</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {productDetails.product.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${productDetails.product.name} - ${index + 1}`}
                        className="rounded-lg object-cover w-full aspect-square"
                      />
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Product Details */}
              <div>
                <h4 className="text-sm font-medium mb-3">Product Information</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Regular Price</p>
                      <p className="font-medium">{formatPrice(productDetails.product.price)}</p>
                    </div>
                    {productDetails.product.salePrice && (
                      <div>
                        <p className="text-sm text-muted-foreground">Sale Price</p>
                        <p className="font-medium text-green-600">
                          {formatPrice(productDetails.product.salePrice)}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">Size</p>
                      <p className="font-medium capitalize">{productDetails.product.jewelrySize.toLowerCase()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge variant="secondary" className={productDetails.product.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}>
                        {productDetails.product.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Description</p>
                    <p className="text-sm">{productDetails.product.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        ) : (
          <div className="flex items-center justify-center h-[80vh] px-6">
            <p className="text-muted-foreground">Product details not found</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}