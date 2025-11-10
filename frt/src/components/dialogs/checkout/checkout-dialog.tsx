'use client'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useState } from 'react'
import { useCartStore } from '@/store/cart-store'
import { ShippingAddress } from './shipping-address'
import { Loader2, ShoppingBag } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface CheckoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CheckoutDialog({ open, onOpenChange }: CheckoutDialogProps) {
  const { items, summary } = useCartStore()
  const [selectedAddress, setSelectedAddress] = useState<{
    id: string;
    userId: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
  }>();

  // Prevent dialog from closing on escape or outside click
  const handleOpenChange = (newOpen: boolean) => {
    // Only allow closing via explicit user action (X button)
    // Don't auto-close on escape or overlay click
    if (!newOpen) {
      // You can add confirmation here if needed
      onOpenChange(newOpen)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="sm:max-w-[800px] w-[750px] h-[550px] bg-background rounded-none overflow-hidden flex flex-col"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="flex flex-1 flex-row w-full overflow-hidden">
          {/* Left: Shipping Address */}
          <div className="flex-1 mr-8">
    
            <ShippingAddress 
              onAddressSelect={(address) => {
                setSelectedAddress(address);
                // Handle the selected address, e.g., proceed to next step
                console.log('Selected address for shipping:', address);
              }}
              selectedAddressId={selectedAddress?.id}
            />
            <div className="px-6 mt-6 text-xs text-gray-500">
              All rights reserved Cozy Girlly
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="w-[300px] shrink-0 pl-8 border-l border-border">
            <div className="mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Order Summary
              </h2>
            </div>

            <ScrollArea className="h-[280px] pr-4">
              {items?.map((item: ICart) => (
                <div key={item.productId} className="flex gap-3 items-start mb-4 group pt-3 pb-2 first:pt-0">
                  <div className="relative pt-2 pr-2">
                    <img
                      src={item.product?.images[0] || "https://placehold.co/56x56"}
                      alt={item.product?.name}
                      className="rounded-lg w-14 h-14 object-cover bg-muted"
                    />
                    <div className="absolute -top-0 -right-0 min-w-5 h-5 px-1.5 bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center rounded-full shadow-sm">
                      {item.quantity}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{item.product?.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      ₹{((item.product?.salePrice || item.product?.price || 0) * item.quantity).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>

            <div className="border-t border-border mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{summary.subtotal?.toLocaleString('en-IN')}</span>
              </div>
              
              {summary.discount > 0 && (
                <div className="flex justify-between">
                  <span>Discount</span>
                  <span className="text-green-600">
                    -₹{summary.discount?.toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping</span>
                <span>₹40.00</span>
              </div>

              <hr className="border-border my-3" />

              <div className="flex justify-between font-bold">
                <span className="text-base">Total</span>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">INR</div>
                  <div className="text-lg">₹{(summary.total + 40).toLocaleString('en-IN')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}