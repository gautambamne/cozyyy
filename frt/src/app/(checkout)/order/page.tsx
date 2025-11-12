'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store/cart-store'
import { useToast } from '@/hooks/use-toast'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AddressAction } from '@/api-actions/address-actions'
import { OrderAction } from '@/api-actions/order-actions'
import { Loader2, MapPin, Phone, Check, Plus, MoreVertical, ArrowRight } from 'lucide-react'
import type { ICreateOrderSchema } from '@/schema/order-sceham'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreateAddressSchema, type ICreateAddressSchema } from '@/schema/address-schema'

export default function OrderPage() {
  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { items, summary } = useCartStore()
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('COD')
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)

  // Form setup
  const form = useForm<ICreateAddressSchema>({
    resolver: zodResolver(CreateAddressSchema),
    defaultValues: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      phone: '',
      isDefault: false,
    },
  })

  // Fetch addresses
  const { data: addressesData, isLoading: addressesLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => AddressAction.GetAddressesAction({ page: 1, limit: 50, isDefault: false }),
  })

  // Set first address as default
  useEffect(() => {
    if (addressesData?.addresses && addressesData.addresses.length > 0) {
      const defaultAddress = addressesData.addresses.find(a => a.isDefault)
      setSelectedAddressId(defaultAddress?.id || addressesData.addresses[0].id)
    }
  }, [addressesData])

  // Create address mutation
  const createAddressMutation = useMutation({
    mutationFn: (data: ICreateAddressSchema) => AddressAction.CreateAddressAction(data),
    onSuccess: (data) => {
      toast({
        title: 'Success',
        description: 'Address added successfully!',
      })
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      setIsAddressDialogOpen(false)
      form.reset()
      // Select the newly created address
      setSelectedAddressId(data.address.id)
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create address',
      })
    },
  })

  // Update address mutation
  const updateAddressMutation = useMutation({
    mutationFn: (data: ICreateAddressSchema) => 
      AddressAction.UpdateAddressAction(editingAddressId!, data),
    onSuccess: (data) => {
      toast({
        title: 'Success',
        description: 'Address updated successfully!',
      })
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      setIsAddressDialogOpen(false)
      setEditingAddressId(null)
      form.reset()
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update address',
      })
    },
  })

  // Delete address mutation
  const deleteAddressMutation = useMutation({
    mutationFn: (id: string) => AddressAction.DeleteAddressAction({ id }),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Address deleted successfully!',
      })
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete address',
      })
    },
  })

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (data: ICreateOrderSchema) => {
      return await OrderAction.CreateOrderAction(data)
    },
    onSuccess: async (data) => {
      toast({
        title: 'Success',
        description: 'Order placed successfully!',
      })
      
      // Clear cart immediately without awaiting
      useCartStore.getState().clearCart().catch((error) => {
        console.error('Failed to clear cart after order:', error)
      })
      
      // Batch invalidate queries
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      
      // Redirect immediately - no delay needed
      router.push('/order/success')
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create order',
      })
    },
  })

  // Handle address form submission
  const onSubmitAddress = form.handleSubmit((data: ICreateAddressSchema) => {
    if (editingAddressId) {
      updateAddressMutation.mutate(data)
    } else {
      createAddressMutation.mutate(data)
    }
  })

  // Handle edit address
  const handleEditAddress = (address: any) => {
    setEditingAddressId(address.id)
    form.reset({
      street: address.street,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone,
      isDefault: address.isDefault,
    })
    setIsAddressDialogOpen(true)
  }

  // Handle delete address
  const handleDeleteAddress = (addressId: string) => {
    if (confirm('Are you sure you want to delete this address?')) {
      deleteAddressMutation.mutate(addressId)
    }
  }

  // Handle place order
  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast({
        title: 'Error',
        description: 'Please select a delivery address',
      })
      return
    }

    if (items.length === 0) {
      toast({
        title: 'Error',
        description: 'Your cart is empty',
      })
      return
    }

    const orderData: ICreateOrderSchema = {
      addressId: selectedAddressId,
      paymentMethod: selectedPaymentMethod as any,
    }

    createOrderMutation.mutate(orderData)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 via-white to-neutral-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Section - Delivery & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header - Enhanced */}
            <div className="bg-gradient-to-r from-amber-50 to-transparent dark:from-amber-950/20 dark:to-transparent p-6 rounded-xl border border-amber-200/50 dark:border-amber-900/30">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-light tracking-tight text-neutral-900 dark:text-neutral-50">Checkout</h1>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Complete your purchase securely</p>
                </div>
              </div>
            </div>

            {/* Delivery Address Section - Enhanced */}
            <div className="bg-card border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-amber-700 dark:text-amber-400" />
                  </div>
                  <span>Delivery Address</span>
                </h2>
                
                {/* Add New Address Button */}
                <Dialog 
                  open={isAddressDialogOpen} 
                  onOpenChange={(open) => {
                    if (!open) {
                      setIsAddressDialogOpen(false)
                      setEditingAddressId(null)
                      form.reset()
                    } else {
                      setIsAddressDialogOpen(true)
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      New Address
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingAddressId ? 'Edit Address' : 'Add New Address'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingAddressId 
                          ? 'Update the details for this delivery address'
                          : 'Fill in the details to add a new delivery address'
                        }
                      </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                      <div className="space-y-4">
                        {/* Street */}
                        <FormField
                          control={form.control}
                          name="street"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Street Address</FormLabel>
                              <FormControl>
                                <Input placeholder="123 Main Street, Apt 4B" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          {/* City */}
                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                  <Input placeholder="Mumbai" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* State */}
                          <FormField
                            control={form.control}
                            name="state"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>State</FormLabel>
                                <FormControl>
                                  <Input placeholder="Maharashtra" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {/* Postal Code */}
                          <FormField
                            control={form.control}
                            name="postalCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Postal Code</FormLabel>
                                <FormControl>
                                  <Input placeholder="400001" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Country */}
                          <FormField
                            control={form.control}
                            name="country"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Country</FormLabel>
                                <FormControl>
                                  <Input placeholder="India" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Phone */}
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input placeholder="+919876543210" {...field} />
                              </FormControl>
                              <FormDescription>
                                Include country code (e.g., +91 for India)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Is Default */}
                        <FormField
                          control={form.control}
                          name="isDefault"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>
                                  Set as default address
                                </FormLabel>
                                <FormDescription>
                                  This address will be selected by default for future orders
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />

                        <div className="flex gap-3 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsAddressDialogOpen(false)
                              setEditingAddressId(null)
                              form.reset()
                            }}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={onSubmitAddress}
                            disabled={
                              editingAddressId 
                                ? updateAddressMutation.isPending 
                                : createAddressMutation.isPending
                            }
                            className="flex-1"
                          >
                            {(editingAddressId 
                              ? updateAddressMutation.isPending 
                              : createAddressMutation.isPending) && (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            )}
                            {editingAddressId ? 'Update Address' : 'Save Address'}
                          </Button>
                        </div>
                      </div>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              {addressesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : addressesData?.addresses && addressesData.addresses.length > 0 ? (
                <div className="space-y-3">
                  {addressesData.addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedAddressId === address.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedAddressId(address.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-lg">
                            {address.street}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {address.city}, {address.state} {address.postalCode}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {address.country}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Phone className="w-4 h-4" />
                            <span className="text-sm">{address.phone}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {address.isDefault && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                              Default
                            </span>
                          )}
                          <div className="flex items-center gap-2">
                            {selectedAddressId === address.id && (
                              <div className="w-5 h-5 rounded-full border-2 border-primary bg-primary flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditAddress(address)}>
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteAddress(address.id)}
                                  className="text-red-600"
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No addresses found</p>
                  <p className="text-sm text-muted-foreground">Click "New Address" to add your first delivery address</p>
                </div>
              )}
            </div>

            {/* Payment Method Section - Enhanced */}
            <div className="bg-card border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-700 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <span>Payment Method</span>
              </h2>

              <div className="space-y-3">
                {['COD', 'CARD', 'ONLINE'].map((method) => (
                  <div
                    key={method}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedPaymentMethod === method
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedPaymentMethod(method)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">
                          {method === 'COD' && 'Cash on Delivery'}
                          {method === 'CARD' && 'Credit/Debit Card'}
                          {method === 'ONLINE' && 'Online Payment'}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {method === 'COD' && 'Pay when your order arrives'}
                          {method === 'CARD' && 'Pay using your card'}
                          {method === 'ONLINE' && 'Pay using online banking'}
                        </div>
                      </div>
                      {selectedPaymentMethod === method && (
                        <div className="w-5 h-5 rounded-full border-2 border-primary bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Place Order Button - Enhanced */}
            <Button
              size="lg"
              className="w-full h-14 text-base font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
              onClick={handlePlaceOrder}
              disabled={
                createOrderMutation.isPending || 
                !selectedAddressId || 
                items.length === 0
              }
            >
              {createOrderMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing Order...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Place Order
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
            
            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Secure checkout powered by SSL encryption</span>
            </div>
          </div>

          {/* Right Section - Order Summary - Enhanced */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-white to-amber-50/30 dark:from-neutral-900 dark:to-amber-950/10 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 sticky top-8 space-y-4 shadow-lg">
              <div className="flex items-center gap-3 pb-4 border-b border-neutral-200 dark:border-neutral-800">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-700 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold">Order Summary</h3>
              </div>

              {/* Products List */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {items && items.length > 0 ? (
                  items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3 pb-4 border-b last:border-b-0 last:pb-0"
                    >
                      <div className="shrink-0">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                          {item.product.images && item.product.images.length > 0 ? (
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted" />
                          )}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {item.product.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            Qty: {item.quantity}
                          </span>
                        </div>
                        <div className="text-sm font-semibold mt-2">
                          ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No items in cart</p>
                  </div>
                )}
              </div>

              {items.length > 0 && <div className="border-t" />}

              {items.length > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{summary.subtotal.toLocaleString('en-IN')}</span>
                  </div>

                  {summary.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="text-green-600">
                        -₹{summary.discount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Taxes</span>
                    <span>₹0.00</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>
                      {summary.total > 500 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        <span>₹40.00</span>
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between pt-3 border-t">
                    <span className="font-semibold">Total</span>
                    <div className="text-right">
                      <div className="font-semibold text-lg">
                        ₹{summary.total.toLocaleString('en-IN')}
                      </div>
                      <div className="text-xs text-muted-foreground">INR</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}