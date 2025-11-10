'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cart-store"
import { Loader2 } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { CheckoutDialog } from "@/components/dialogs/checkout/checkout-dialog"

export default function CartSummary() {
  const { summary, clearCart } = useCartStore()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [showCheckout, setShowCheckout] = useState(false)

  const handleCheckout = () => {
    // Just open the checkout dialog, don't close the cart
    setShowCheckout(true)
  }

  const handleCheckoutClose = (open: boolean) => {
    setShowCheckout(open)
  }

  const clearMutation = useMutation({
    mutationFn: clearCart,
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to clear cart",
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    }
  })

  return (
    <>
      <div className="border-t bg-background w-full shadow-md mt-auto">
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            {/* Subtotal */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{summary.subtotal.toLocaleString('en-IN')}</span>
            </div>
            
            {/* Discount */}
            {summary.discount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-green-600">
                  -₹{summary.discount.toLocaleString('en-IN')}
                </span>
              </div>
            )}

            {/* Taxes */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Taxes</span>
              <span>₹0.00</span>
            </div>

            {/* Shipping */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span className="text-muted-foreground">Calculated at checkout</span>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between border-t pt-2">
              <span className="font-medium">Total</span>
              <span className="font-medium">₹{summary.total.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => clearMutation.mutate()}
              disabled={clearMutation.isPending || summary.itemCount === 0}
            >
              {clearMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              Clear Cart
            </Button>
            <Button 
              className="flex-1"
              disabled={summary.itemCount === 0}
              onClick={handleCheckout}
            >
              Checkout
            </Button>
          </div>
        </div>
      </div>
      
      <CheckoutDialog 
        open={showCheckout} 
        onOpenChange={handleCheckoutClose} 
      />
    </>
  )
}