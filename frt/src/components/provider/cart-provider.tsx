'use client'

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CartAction } from '@/api-actions/cart-actions'
import { useCartStore } from '@/store/cart-store'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import CartItems from '../base/cart/cart-items'
import CartHeader from '../base/cart/cart-header'
import CartSummary from '../base/cart/cart-summary'
import useAuthStore from '@/store/auth-store'

export function CartProvider() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)
  const { isOpen, closeCart, setItems, setSummary } = useCartStore()

  // Fetch cart data
  const { data: cartData } = useQuery({
    queryKey: ['cart'],
    queryFn: () => CartAction.GetCartAction(),
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Update local store when cart data changes
  useEffect(() => {
    if (cartData) {
      setItems(cartData.cart.items)
      setSummary(cartData.cart.summary)
    }
  }, [cartData, setItems, setSummary])

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetContent 
        className="[&>button]:hidden flex w-full sm:max-w-md flex-col h-full p-0" 
        side="right"
      >
        <SheetTitle className="sr-only">Shopping Cart</SheetTitle>
        <CartHeader />
        <CartItems />
        <CartSummary />
      </SheetContent>
    </Sheet>
  )
}
