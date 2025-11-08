'use client'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useCartStore } from '@/store/cart-store'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'

interface CheckoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CheckoutDialog({ open, onOpenChange }: CheckoutDialogProps) {
  const { summary } = useCartStore()
  const [saveInfo, setSaveInfo] = useState(false)

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
        className="sm:max-w-[1100px] bg-black text-white"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="flex flex-1 flex-row w-full">
          {/* Left: Shipping Address */}
          <div className="flex-1 mr-10">
            <h1 className="text-2xl font-bold mb-6">Shipping address</h1>
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="mb-1 block text-sm font-medium">Country/Region</label>
                <Select defaultValue="United States">
                  <SelectTrigger className="w-full rounded-lg bg-[#111] border-gray-700">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="United States">United States</SelectItem>
                    <SelectItem value="India">India</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-4">
                <Input
                  placeholder="First name (optional)"
                  className="flex-1 rounded-lg bg-[#111] border-gray-700"
                />
                <Input
                  placeholder="Last name"
                  className="flex-1 rounded-lg bg-[#111] border-gray-700"
                />
              </div>

              <div>
                <Input
                  placeholder="Address"
                  className="w-full rounded-lg bg-[#111] border-gray-700"
                />
                <span className="text-xs text-gray-400 flex items-center mt-1">
                  <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 12 12">
                    <circle cx="6" cy="6" r="5.5" />
                  </svg>
                  Add a house number if you have one
                </span>
              </div>

              <div>
                <Input
                  placeholder="Apartment, suite, etc. (optional)"
                  className="w-full rounded-lg bg-[#111] border-gray-700"
                />
              </div>

              <div className="flex gap-4">
                <Input
                  placeholder="City"
                  className="flex-1 rounded-lg bg-[#111] border-gray-700"
                />
                <Select defaultValue="Hawaii">
                  <SelectTrigger className="flex-1 rounded-lg bg-[#111] border-gray-700">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hawaii">Hawaii</SelectItem>
                    {/* Add more states */}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="ZIP code"
                  className="flex-1 rounded-lg bg-[#111] border-gray-700"
                />
              </div>
              
              <span className="text-xs text-gray-400 flex items-center mt-1">
                <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 12 12">
                  <circle cx="6" cy="6" r="5.5" />
                </svg>
                Did you mean <span className="text-blue-400 ml-1">Aiea?</span>
              </span>

              <label className="flex items-center gap-3 mt-3 text-sm">
                <Checkbox
                  checked={saveInfo}
                  onCheckedChange={(checked) => setSaveInfo(checked as boolean)}
                  className="border-gray-700 bg-[#222]"
                />
                Save this information for next time
              </label>

              <Button
                type="button"
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 rounded-lg py-3 font-semibold text-white transition"
                onClick={() => {
                  // Handle form submission
                  console.log('Continue to shipping')
                }}
              >
                Continue to shipping
              </Button>
            </form>
            
            <div className="mt-10 text-xs text-gray-500">
              All rights reserved Dev Vercel Shop
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="w-[340px] flex-shrink-0 pl-10 border-l border-gray-800">
            <div className="flex gap-3 items-center mb-6">
              <div className="relative">
                <img
                  src="https://placehold.co/56x56"
                  alt="Product"
                  className="rounded-lg w-14 h-14 object-cover"
                />
                <div className="absolute -top-2 -right-2 bg-gray-700 text-xs px-2 py-1 rounded-full border border-gray-900">
                  1
                </div>
              </div>
              <div>
                <div className="font-bold text-white">Acme Cup</div>
                <div className="text-sm text-gray-400">Black</div>
              </div>
            </div>

            <div className="space-y-2 text-md">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{summary.subtotal.toLocaleString('en-IN')}</span>
              </div>
              
              {summary.discount > 0 && (
                <div className="flex justify-between">
                  <span>Discount</span>
                  <span className="text-green-600">
                    -₹{summary.discount.toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping</span>
                <span>₹4.90</span>
              </div>

              <hr className="border-gray-800 my-4" />

              <div className="flex justify-between font-bold">
                <span className="text-lg">Total</span>
                <div className="text-right">
                  <div className="text-sm text-gray-400">USD</div>
                  <div className="text-xl">₹{(summary.total + 4.90).toLocaleString('en-IN')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}