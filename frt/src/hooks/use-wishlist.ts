'use client';

import { useState, useCallback } from 'react';

export function useWishlist() {
  // In a real app, this would be synced with backend/localStorage
  const [wishlistedItems, setWishlistedItems] = useState<Set<string>>(new Set());

  const toggleWishlist = useCallback((productId: string) => {
    setWishlistedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  }, []);

  const isWishlisted = useCallback((productId: string) => {
    return wishlistedItems.has(productId);
  }, [wishlistedItems]);

  return {
    toggleWishlist,
    isWishlisted,
  };
}