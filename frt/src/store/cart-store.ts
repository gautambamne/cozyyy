import { create } from 'zustand'
import { CartAction } from '@/api-actions/cart-actions'

interface CartStore {
  isOpen: boolean
  items: ICart[]
  summary: ISummary
  totalItems: number
  // Actions
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  setItems: (items: ICart[]) => void
  setSummary: (summary: ISummary) => void
  // Cart Operations
  addItem: (productId: string, quantity: number) => Promise<void>
  updateItem: (productId: string, quantity: number) => Promise<void>
  removeItem: (productId: string) => Promise<void>
  clearCart: () => Promise<void>
}

const initialSummary: ISummary = {
  subtotal: 0,
  discount: 0,
  total: 0,
  itemCount: 0
}

export const useCartStore = create<CartStore>((set, get) => ({
  isOpen: false,
  items: [],
  summary: initialSummary,
  totalItems: 0,

  // UI Actions
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  
  // State Setters
  setItems: (items) => set({ items, totalItems: items.length }),
  setSummary: (summary) => set({ summary }),

  // Cart Operations
  addItem: async (productId: string, quantity: number) => {
    try {
      const response = await CartAction.AddToCartAction({ productId, quantity })
      // Refetch cart data to update state
      const cartData = await CartAction.GetCartAction()
      set({ 
        items: cartData.cart.items,
        summary: cartData.cart.summary,
        totalItems: cartData.cart.items.length,
        isOpen: true // Open cart after adding item
      })
    } catch (error) {
      console.error('Failed to add item to cart:', error)
      throw error
    }
  },

  updateItem: async (productId: string, quantity: number) => {
    try {
      await CartAction.UpdateCartAction({ productId, quantity })
      const cartData = await CartAction.GetCartAction()
      set({ 
        items: cartData.cart.items,
        summary: cartData.cart.summary,
        totalItems: cartData.cart.items.length
      })
    } catch (error) {
      console.error('Failed to update cart item:', error)
      throw error
    }
  },

  removeItem: async (productId: string) => {
    try {
      await CartAction.RemoveFromCartAction({ productId })
      const cartData = await CartAction.GetCartAction()
      set({ 
        items: cartData.cart.items,
        summary: cartData.cart.summary,
        totalItems: cartData.cart.items.length
      })
    } catch (error) {
      console.error('Failed to remove item from cart:', error)
      throw error
    }
  },

  clearCart: async () => {
    try {
      await CartAction.ClearCartAction()
      set({ 
        items: [],
        summary: initialSummary,
        totalItems: 0
      })
    } catch (error) {
      console.error('Failed to clear cart:', error)
      throw error
    }
  },
}))
