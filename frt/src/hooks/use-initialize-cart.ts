import { useEffect } from 'react'
import { useCartStore } from '@/store/cart-store'
import useAuthStore from '@/store/auth-store'

/**
 * Hook to initialize cart data from backend
 * Automatically fetches cart data if user is authenticated
 */
export function useInitializeCart() {
  const { initializeCart, isInitialized } = useCartStore()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated && !isInitialized) {
      initializeCart().catch((error) => {
        console.error('Failed to initialize cart:', error)
      })
    }
  }, [isAuthenticated, isInitialized, initializeCart])
}
