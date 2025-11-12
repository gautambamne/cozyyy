'use client'

import { useEffect, useRef } from 'react'
import { useCartStore } from '@/store/cart-store'
import useAuthStore from '@/store/auth-store'
import { getCookie } from 'cookies-next/client'

/**
 * SessionInitializer Component
 * Initializes cart and auth session on app startup
 * Should be placed in the root layout
 */
export function SessionInitializer() {
  const { initializeCart, isInitialized } = useCartStore()
  const { isAuthenticated } = useAuthStore()
  const initAttemptedRef = useRef(false)

  useEffect(() => {
    // Only attempt initialization once
    if (initAttemptedRef.current) return
    initAttemptedRef.current = true

    // Only initialize cart if user is authenticated
    if (isAuthenticated && !isInitialized) {
      initializeCart().catch((error) => {
        console.error('Session initialization error:', error)
        // Cart initialization failure is not critical
      })
    }
  }, [isAuthenticated, isInitialized, initializeCart])

  // This component doesn't render anything
  return null
}
