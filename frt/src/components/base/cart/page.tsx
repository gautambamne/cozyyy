'use client';

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Image from "next/image";

export default function CartPage() {
  return (
    <div className="fixed inset-y-0 right-0 h-full w-full sm:w-[400px] bg-background border-l z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">My Cart</h2>
        <Button variant="ghost" size="icon">
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto h-[calc(100vh-270px)]">
        <div className="p-4">
          {/* Sample Cart Item */}
          <div className="flex gap-4 mb-4 pb-4 border-b">
            <div className="relative h-20 w-20 rounded-md overflow-hidden">
              <Image
                src="/demo-product.jpg"
                alt="Product"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-medium">Acme Circles T-Shirt</h3>
                  <p className="text-sm text-muted-foreground">Black / XS</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center border rounded-md">
                  <Button variant="ghost" size="icon" className="h-8 w-8">-</Button>
                  <span className="w-8 text-center">1</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8">+</Button>
                </div>
                <span className="font-medium">$15.00 USD</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="absolute bottom-0 w-full bg-background border-t">
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            {/* Subtotal */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>$15.00 USD</span>
            </div>
            {/* Taxes */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Taxes</span>
              <span>$0.00 USD</span>
            </div>
            {/* Shipping */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span className="text-muted-foreground">Calculated at checkout</span>
            </div>
            {/* Total */}
            <div className="flex items-center justify-between border-t pt-2">
              <span className="font-medium">Total</span>
              <span className="font-medium">$15.00 USD</span>
            </div>
          </div>

          {/* Checkout Button */}
          <Button className="w-full">
            Proceed to Checkout
          </Button>
        </div>
      </div>
    </div>
  );
}
