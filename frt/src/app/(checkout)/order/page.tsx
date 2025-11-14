'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store/cart-store'
import { useToast } from '@/hooks/use-toast'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AddressAction } from '@/api-actions/address-actions'
import { OrderAction } from '@/api-actions/order-actions'
import { PaymentAction } from '@/api-actions/payment-actions'
import { Loader2, MapPin, Phone, Check, Plus, MoreVertical, ArrowRight, ShieldCheck, Truck, Sparkles } from 'lucide-react'
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
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Separator } from '@/components/ui/separator'

export default function OrderPage() {
  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { items, summary, initializeCart } = useCartStore()
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('COD')
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)

  // Initialize cart on mount to ensure it's synced
  useEffect(() => {
    initializeCart().catch((error) => {
      console.error('Failed to initialize cart:', error)
    })
  }, [initializeCart])

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

  useEffect(() => {
    if (addressesData?.addresses && addressesData.addresses.length > 0) {
      const defaultAddress = addressesData.addresses.find(a => a.isDefault)
      setSelectedAddressId(defaultAddress?.id || addressesData.addresses[0].id)
    }
  }, [addressesData])

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
      setSelectedAddressId(data.address.id)
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create address',
      })
    },
  })

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

  const createOrderMutation = useMutation({
    mutationFn: async (data: ICreateOrderSchema) => {
      return await OrderAction.CreateOrderAction(data)
    },
    onSuccess: async (data) => {
      console.log('Order created successfully:', data)
      
      // Handle CARD payment method - redirect to Stripe Checkout
      if (selectedPaymentMethod === 'CARD' && data.order?.id) {
        try {
          toast({
            title: 'Creating Payment Session',
            description: 'Redirecting to payment page...',
          })
          
          // Create Stripe Checkout Session
          const checkoutSession = await PaymentAction.CreateCheckoutSessionAction({
            orderId: data.order.id,
            successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${window.location.origin}/order?canceled=true`,
          })
          
          // Redirect to Stripe Checkout
          if (checkoutSession.url) {
            window.location.href = checkoutSession.url
          } else {
            throw new Error('No checkout URL received')
          }
        } catch (error) {
          console.error('Failed to create checkout session:', error)
          toast({
            title: 'Payment Error',
            description: error instanceof Error ? error.message : 'Failed to initialize payment. Please try again.',
          })
        }
        return // Don't clear cart yet, wait for payment confirmation via webhook
      }
      
      // For COD and other payment methods, clear cart immediately
      try {
        await useCartStore.getState().clearCart()
        
        queryClient.invalidateQueries({ queryKey: ['cart'] })
        queryClient.invalidateQueries({ queryKey: ['orders'] })
        
        toast({
          title: 'Success',
          description: 'Order placed successfully!',
        })
        router.push('/success')
      } catch (error) {
        console.error('Failed to clear cart after order:', error)
        toast({
          title: 'Order Placed',
          description: 'Order created successfully. Please refresh your cart.',
        })
        router.push('/success')
      }
    },
    onError: async (error) => {
      // Re-sync cart from server on error to ensure it's not lost
      try {
        await useCartStore.getState().initializeCart()
      } catch (syncError) {
        console.error('Failed to re-sync cart after order error:', syncError)
      }
      
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create order',
      })
    },
  })

  const onSubmitAddress = form.handleSubmit((data: ICreateAddressSchema) => {
    if (editingAddressId) {
      updateAddressMutation.mutate(data)
    } else {
      createAddressMutation.mutate(data)
    }
  })

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

  const handleDeleteAddress = (addressId: string) => {
    if (confirm('Are you sure you want to delete this address?')) {
      deleteAddressMutation.mutate(addressId)
    }
  }

  const handlePlaceOrder = async () => {
    // Validate address
    if (!selectedAddressId) {
      toast({
        title: 'Error',
        description: 'Please select a delivery address',
      })
      return
    }
    
    // Validate cart - check both local state and ensure it's synced
    if (items.length === 0) {
      toast({
        title: 'Error',
        description: 'Your cart is empty. Please add items to your cart.',
      })
      // Try to re-sync cart in case it's out of sync
      try {
        await useCartStore.getState().initializeCart()
      } catch (error) {
        console.error('Failed to sync cart:', error)
      }
      return
    }
    
    // Validate summary
    if (!summary || summary.total <= 0) {
      toast({
        title: 'Error',
        description: 'Invalid cart total. Please refresh and try again.',
      })
      // Re-sync cart
      try {
        await useCartStore.getState().initializeCart()
      } catch (error) {
        console.error('Failed to sync cart:', error)
      }
      return
    }
    
    // Proceed with order creation
    const orderData: ICreateOrderSchema = {
      addressId: selectedAddressId,
      paymentMethod: selectedPaymentMethod as any,
    }
    createOrderMutation.mutate(orderData)
  }

  return (
    <div className="relative min-h-screen bg-linear-to-br from-neutral-50 via-amber-50/40 to-white dark:from-neutral-950 dark:via-amber-950/30 dark:to-neutral-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(244,197,125,0.18),transparent_55%)] dark:bg-[radial-gradient(circle_at_top,rgba(245,200,140,0.12),transparent_55%)]" />
      <div className="relative container mx-auto px-4 py-10 sm:py-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left - Addresses and Payment */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-amber-100/60 bg-white/80 backdrop-blur-sm shadow-xl dark:border-amber-900/50 dark:bg-neutral-950/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Sparkles className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  Almost There
                </CardTitle>
                <CardDescription className="pt-2 text-sm text-neutral-600 dark:text-neutral-400">
                  Complete your purchase with confidence—your handcrafted pieces are moments away.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                <div className="flex gap-3 rounded-lg border border-amber-100/60 bg-white/70 p-3 text-sm shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-amber-900/40 dark:bg-neutral-900/70">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/15 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">Confirm Address</p>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">Choose where we deliver your treasures.</p>
                  </div>
                </div>
                <div className="flex gap-3 rounded-lg border border-amber-100/60 bg-white/70 p-3 text-sm shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-amber-900/40 dark:bg-neutral-900/70">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/15 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">Secure Payment</p>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">All transactions are SSL encrypted.</p>
                  </div>
                </div>
                <div className="flex gap-3 rounded-lg border border-amber-100/60 bg-white/70 p-3 text-sm shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-amber-900/40 dark:bg-neutral-900/70">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/15 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">Express Dispatch</p>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">Orders ship within 24-48 hours.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-transparent bg-white/85 shadow-xl ring-1 ring-amber-100/70 backdrop-blur dark:bg-neutral-950/80 dark:ring-amber-900/40">
              {/* REFRACTORED HEADER - TITLE AND NEW ADDRESS BUTTON INLINE */}
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MapPin className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    Delivery Address
                  </CardTitle>
                  <CardDescription className="text-neutral-600 dark:text-neutral-400">
                    Select or add the destination for your order.
                  </CardDescription>
                </div>
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
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border border-amber-100/60 bg-linear-to-br from-white via-amber-50/40 to-white/90 shadow-2xl backdrop-blur-xl dark:border-amber-900/50 dark:from-neutral-950 dark:via-amber-950/20 dark:to-neutral-950">
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
                        {/* ...rest of address form fields... */}
                        <FormField
                          control={form.control}
                          name="street"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Street Address</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="123 Main Street, Apt 4B"
                                  className="bg-white/70 focus-visible:ring-amber-500 dark:bg-neutral-900/60"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Mumbai"
                                    className="bg-white/70 focus-visible:ring-amber-500 dark:bg-neutral-900/60"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="state"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>State</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Maharashtra"
                                    className="bg-white/70 focus-visible:ring-amber-500 dark:bg-neutral-900/60"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="postalCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Postal Code</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="400001"
                                    className="bg-white/70 focus-visible:ring-amber-500 dark:bg-neutral-900/60"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="country"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Country</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="India"
                                    className="bg-white/70 focus-visible:ring-amber-500 dark:bg-neutral-900/60"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="+919876543210"
                                  className="bg-white/70 focus-visible:ring-amber-500 dark:bg-neutral-900/60"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Include country code (e.g., +91 for India)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="isDefault"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  className="border-amber-200/60 data-[state=checked]:bg-amber-500 data-[state=checked]:text-white dark:border-amber-900/60"
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
              </CardHeader>

              <CardContent>
                {addressesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : addressesData?.addresses && addressesData.addresses.length > 0 ? (
                  <div className="space-y-3">
                    {addressesData.addresses.map((address) => (
                      <Card 
                        key={address.id}
                        className={`cursor-pointer border transition-all shadow-sm backdrop-blur-sm ${
                          selectedAddressId === address.id
                            ? 'border-amber-500/60 bg-amber-50/60 shadow-md dark:border-amber-400/60 dark:bg-amber-500/10'
                            : 'border-amber-100/70 bg-white/80 hover:-translate-y-0.5 hover:border-amber-400/60 dark:border-amber-900/50 dark:bg-neutral-950/70'
                        }`}
                        onClick={() => setSelectedAddressId(address.id)}
                      >
                        <CardContent className="flex items-start justify-between gap-4 p-4 sm:p-5">
                          <div className="flex-1">
                            <div className="font-medium text-sm text-neutral-900 dark:text-neutral-100">{address.street}</div>
                            <div className="mt-0.5 text-xs text-neutral-600 dark:text-neutral-400">
                              {address.city}, {address.state} {address.postalCode}
                            </div>
                            <div className="text-xs text-neutral-600 dark:text-neutral-400">{address.country}</div>
                            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-neutral-700 dark:text-neutral-300">
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:bg-amber-400/15 dark:text-amber-300">
                                <Phone className="w-3.5 h-3.5" />
                              </div>
                              <span>{address.phone}</span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1.5 items-end min-w-[60px]">
                            {address.isDefault && (
                              <span className="rounded-full bg-emerald-100/80 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                                Default
                              </span>
                            )}
                            <div className="flex items-center gap-1.5">
                              {selectedAddressId === address.id && (
                                <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-amber-500 bg-amber-500 text-white shadow-sm dark:border-amber-400 dark:bg-amber-400">
                                  <Check className="w-3 h-3" />
                                </div>
                              )}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                    <MoreVertical className="h-3.5 w-3.5" />
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
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No addresses found</p>
                    <p className="text-sm text-muted-foreground">Click "New Address" to add your first delivery address</p>
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Payment Card */}
            <Card className="border-transparent bg-white/85 shadow-xl ring-1 ring-amber-100/70 backdrop-blur dark:bg-neutral-950/80 dark:ring-amber-900/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['COD', 'CARD', 'ONLINE'].map((method) => (
                    <Card
                      key={method}
                      className={`cursor-pointer border transition-all shadow-sm backdrop-blur-sm ${
                        selectedPaymentMethod === method
                          ? 'border-amber-500/60 bg-amber-50/70 shadow-md dark:border-amber-400/60 dark:bg-amber-500/10'
                          : 'border-amber-100/70 bg-white/85 hover:-translate-y-0.5 hover:border-amber-400/60 dark:border-amber-900/50 dark:bg-neutral-950/70'
                      }`}
                      onClick={() => setSelectedPaymentMethod(method)}
                    >
                      <CardContent className="flex items-center justify-between p-4">
                        <div>
                          <div className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                            {method === 'COD' && 'Cash on Delivery'}
                            {method === 'CARD' && 'Credit/Debit Card'}
                            {method === 'ONLINE' && 'Online Payment'}
                          </div>
                          <div className="mt-0.5 text-xs text-neutral-600 dark:text-neutral-400">
                            {method === 'COD' && 'Pay when your order arrives'}
                            {method === 'CARD' && 'Pay using your card'}
                            {method === 'ONLINE' && 'Pay using online banking'}
                          </div>
                        </div>
                        {selectedPaymentMethod === method && (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-amber-500 bg-amber-500 text-white shadow-sm dark:border-amber-400 dark:bg-amber-400">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
            <div className="space-y-4 rounded-2xl border border-amber-100/70 bg-white/90 p-5 shadow-xl backdrop-blur dark:border-amber-900/40 dark:bg-neutral-950/80">
              <Button
                size="lg"
                className="w-full h-14 rounded-xl bg-neutral-900 text-base font-semibold tracking-wide text-white shadow-lg transition hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200"
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
                    Place Order
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Secure payments</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span>Free shipping above ₹500</span>
                </div>
              </div>
            </div>
          </div>
          {/* Right - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 border-transparent bg-white/90 shadow-2xl ring-1 ring-amber-100/70 backdrop-blur dark:bg-neutral-950/85 dark:ring-amber-900/40">
              <CardHeader>
                <CardTitle className="text-xl text-neutral-900 dark:text-neutral-100">Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <Separator className="mb-4 border-amber-100/70 dark:border-amber-900/40" />
                <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
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
                          <h4 className="font-medium text-sm text-neutral-900 dark:text-neutral-100 truncate">{item.product.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-neutral-500 dark:text-neutral-400">
                              Qty: {item.quantity}
                            </span>
                          </div>
                          <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mt-2">
                            ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-neutral-500 dark:text-neutral-400">No items in cart</p>
                    </div>
                  )}
                </div>
                {items.length > 0 && <Separator className="my-4 border-amber-100/70 dark:border-amber-900/40" />}
                {items.length > 0 && (
                  <div className="space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span className="font-medium text-neutral-900 dark:text-neutral-100">
                        ₹{summary.subtotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                    {summary.discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Discount</span>
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                          -₹{summary.discount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span>Taxes</span>
                      <span className="font-medium text-neutral-900 dark:text-neutral-100">₹0.00</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>
                        {summary.total > 500 ? (
                          <span className="font-medium text-emerald-600 dark:text-emerald-400">Free</span>
                        ) : (
                          <span className="font-medium text-neutral-900 dark:text-neutral-100">₹40.00</span>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-amber-100/70 dark:border-amber-900/40">
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100">Total</span>
                      <div className="text-right">
                        <div className="font-semibold text-lg text-neutral-900 dark:text-neutral-100">
                          ₹{summary.total.toLocaleString('en-IN')}
                        </div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400">INR</div>
                      </div>
                    </div>
                    <div className="rounded-lg border border-amber-100/70 bg-amber-50/70 p-3 text-xs text-neutral-700 shadow-sm dark:border-amber-900/50 dark:bg-amber-500/10 dark:text-neutral-200">
                      Complimentary gift packaging included with every order.
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
