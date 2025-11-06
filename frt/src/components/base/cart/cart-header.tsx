'use client'

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cart-store"

export default function CartHeader() {
  const { closeCart, totalItems } = useCartStore()
  
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div>
        <h2 className="text-lg font-semibold">Shopping Cart</h2>
        <p className="text-sm text-muted-foreground">
          {totalItems} {totalItems === 1 ? 'item' : 'items'}
        </p>
      </div>
      <Button 
        variant="ghost" 
        size="icon"
        onClick={closeCart}
        className="hover:bg-secondary"
      >
        <X className="h-5 w-5" />
        <span className="sr-only">Close cart</span>
      </Button>
    </div>
  )
}