import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartAction } from '@/api-actions/cart-actions'

interface CartStore {
  isOpen: boolean
  items: ICart[]
  summary: ISummary
  totalItems: number
  isInitialized: boolean
  // Actions
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  setItems: (items: ICart[]) => void
  setSummary: (summary: ISummary) => void
  initializeCart: () => Promise<void>
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
  itemCount: 0,
  pending: 0,
  confirmed: 0,
  shipped: 0,
  delivered: 0,
  cancelled: 0,
  todayOrders: 0,
  thisWeekOrders: 0,
  thisMonthOrders: 0
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      isOpen: false,
      items: [],
      summary: initialSummary,
      totalItems: 0,
      isInitialized: false,

      // UI Actions
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      
      // State Setters
      setItems: (items) => set({ items, totalItems: items.length }),
      setSummary: (summary) => set({ summary }),

      // Initialize cart from backend
      initializeCart: async () => {
        try {
          const cartData = await CartAction.GetCartAction()
          set({ 
            items: cartData.cart.items,
            summary: cartData.cart.summary,
            totalItems: cartData.cart.items.length,
            isInitialized: true
          })
        } catch (error) {
          console.error('Failed to initialize cart:', error)
          // If initialization fails, mark as initialized anyway to avoid infinite loops
          set({ isInitialized: true })
        }
      },

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
          // First check if the item exists in the cart
          const currentItems = get().items;
          const itemExists = currentItems.some(item => item.product.id === productId);
          
          if (!itemExists) {
            throw new Error("Item not found in cart");
          }

          // Proceed with removal if item exists
          await CartAction.RemoveFromCartAction({ productId });
          const cartData = await CartAction.GetCartAction();
          set({ 
            items: cartData.cart.items,
            summary: cartData.cart.summary,
            totalItems: cartData.cart.items.length
          });
        } catch (error: any) {
          console.error('Failed to remove item from cart:', error);
          throw error;
        }
      },

      clearCart: async (skipOptimisticUpdate = false) => {
        try {
          // Only clear optimistically if not called from order creation
          if (!skipOptimisticUpdate) {
            set({ 
              items: [],
              summary: initialSummary,
              totalItems: 0
            })
          }
          
          // Call API and wait for response
          await CartAction.ClearCartAction()
          
          // Update state after successful API call
          set({ 
            items: [],
            summary: initialSummary,
            totalItems: 0
          })
        } catch (error) {
          console.error('Failed to clear cart:', error)
          // Re-sync cart from server if clear fails
          try {
            const cartData = await CartAction.GetCartAction()
            set({ 
              items: cartData.cart.items,
              summary: cartData.cart.summary,
              totalItems: cartData.cart.items.length
            })
          } catch (syncError) {
            console.error('Failed to re-sync cart after clear error:', syncError)
          }
          throw error
        }
      },
    }),
    {
      name: 'cart-storage', // name of the item in the storage (must be unique)
      partialize: (state) => ({
        // Only persist items and summary, not UI state
        items: state.items,
        summary: state.summary,
        totalItems: state.totalItems,
        isInitialized: state.isInitialized,
      }),
    }
  )
)
