'use client'

import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cart-store"
import { Loader2 } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"

export default function CartSummary() {
  const { summary, clearCart } = useCartStore()
  const { toast } = useToast()
  const queryClient = useQueryClient()

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
      toast({
        title: "Success",
        description: "Cart cleared successfully",
      })
    }
  })

  return (
    <div className="border-t bg-background">
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
            {clearMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Clear Cart
          </Button>
          <Button 
            className="flex-1"
            disabled={summary.itemCount === 0}
          >
            Checkout
          </Button>
        </div>
      </div>
    </div>
  )
}