'use client'
import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { User, MapPin, Package, Edit2, Plus, Loader2, X, ArrowLeft, Trash2 } from "lucide-react";
import useAuthStore from "@/store/auth-store";
import { OrderAction } from "@/api-actions/order-actions";
import { AddressAction } from "@/api-actions/address-actions";
import { CreateAddressSchema, type ICreateAddressSchema } from "@/schema/address-schema";

const MyAccount = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("account");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

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
  });

  // Helper function to split name into firstName and lastName
  const getNameParts = () => {
    if (user?.firstName && user?.lastName) {
      return { firstName: user.firstName, lastName: user.lastName };
    }
    
    if (user?.name) {
      const nameParts = user.name.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      return { firstName, lastName };
    }
    
    return { firstName: '', lastName: '' };
  };

  // ============ ORDERS QUERIES ============
  
  // Fetch orders with TanStack Query
  const { data: ordersData, isLoading: ordersLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: () => OrderAction.GetOrdersAction({ 
      page: 1, 
      limit: 20, 
      startDate: undefined, 
      endDate: undefined 
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch selected order details
  const { data: orderDetails, isLoading: orderDetailsLoading } = useQuery({
    queryKey: ['order', selectedOrderId],
    queryFn: () => selectedOrderId ? OrderAction.GetOrderDetailsAction({ id: selectedOrderId }) : null,
    enabled: !!selectedOrderId,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });

  // ============ ADDRESSES QUERIES ============

  // Fetch all addresses
  const { 
    data: addressesData, 
    isLoading: addressesLoading, 
    error: addressesError 
  } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => AddressAction.GetAddressesAction(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch default address
  const { data: defaultAddress } = useQuery({
    queryKey: ['defaultAddress'],
    queryFn: () => AddressAction.GetDefaultAddressAction(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // ============ ADDRESSES MUTATIONS ============

  // Delete address mutation
  const deleteAddressMutation = useMutation({
    mutationFn: (addressId: string) => 
      AddressAction.DeleteAddressAction({ id: addressId }),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Address deleted successfully!',
      });
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      queryClient.invalidateQueries({ queryKey: ['defaultAddress'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete address',
      });
    }
  });

  // Create address mutation
  const createAddressMutation = useMutation({
    mutationFn: (data: ICreateAddressSchema) => AddressAction.CreateAddressAction(data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Address added successfully!',
      });
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      queryClient.invalidateQueries({ queryKey: ['defaultAddress'] });
      setIsAddressDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create address',
      });
    }
  });

  // Update address mutation
  const updateAddressMutation = useMutation({
    mutationFn: (data: ICreateAddressSchema) => 
      AddressAction.UpdateAddressAction(editingAddressId!, data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Address updated successfully!',
      });
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      queryClient.invalidateQueries({ queryKey: ['defaultAddress'] });
      setIsAddressDialogOpen(false);
      setEditingAddressId(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update address',
      });
    }
  });

  // ============ HELPER FUNCTIONS ============

  const handleDeleteAddress = useCallback((addressId: string) => {
    if (confirm('Are you sure you want to delete this address?')) {
      deleteAddressMutation.mutate(addressId);
    }
  }, [deleteAddressMutation]);

  const handleEditAddress = (address: any) => {
    setEditingAddressId(address.id);
    form.reset({
      street: address.street,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone,
      isDefault: address.isDefault,
    });
    setIsAddressDialogOpen(true);
  };

  const onSubmitAddress = form.handleSubmit((data: ICreateAddressSchema) => {
    if (editingAddressId) {
      updateAddressMutation.mutate(data);
    } else {
      createAddressMutation.mutate(data);
    }
  });

  // Extract addresses from API response
  const addresses = (addressesData as any)?.addresses || [];

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      'PENDING': 'bg-amber-100 text-amber-800',
      'CONFIRMED': 'bg-blue-100 text-blue-800',
      'SHIPPED': 'bg-purple-100 text-purple-800',
      'DELIVERED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800',
    };
    return statusMap[status] || 'bg-muted text-muted-foreground';
  };

  // Extract orders from API response
  const orders = (ordersData as any)?.orders || (ordersData as any)?.order || [];

  return (
    <div className="min-h-screen bg-background py-6 px-4 sm:px-6 lg:px-8 pt-20">
      <div className="max-w-5xl mx-auto">
        <div className="mb-4">
          <h1 className="text-3xl font-serif font-light text-foreground mb-0.5">My Account</h1>
          <p className="text-xs text-muted-foreground">Manage your account details, addresses, and orders</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4 h-auto p-0.5 bg-card border border-border">
            <TabsTrigger 
              value="account" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1 py-2 text-xs"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Account Details</span>
              <span className="sm:hidden">Account</span>
            </TabsTrigger>
            <TabsTrigger 
              value="addresses" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1 py-2 text-xs"
            >
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Addresses</span>
              <span className="sm:hidden">Address</span>
            </TabsTrigger>
            <TabsTrigger 
              value="orders" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1 py-2 text-xs"
            >
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Order History</span>
              <span className="sm:hidden">Orders</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account">
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-2 pt-3 px-3">
                <CardTitle className="text-base font-serif font-light">Account Information</CardTitle>
                <CardDescription className="text-xs">View your profile details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 px-3 pb-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">First Name</Label>
                    <div className="h-8 px-3 py-2 bg-muted rounded-md flex items-center">
                      <p className="text-xs">{getNameParts().firstName || "N/A"}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Last Name</Label>
                    <div className="h-8 px-3 py-2 bg-muted rounded-md flex items-center">
                      <p className="text-xs">{getNameParts().lastName || "N/A"}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs">Email Address</Label>
                  <div className="h-8 px-3 py-2 bg-muted rounded-md flex items-center">
                    <p className="text-xs">{user?.email || "N/A"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="addresses">
            {addressesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : addressesError ? (
              <Card className="border-border shadow-sm">
                <CardContent className="pt-12 pb-12 text-center">
                  <p className="text-destructive mb-4 text-xs">Error loading addresses</p>
                  <Button 
                    variant="outline" 
                    className="text-xs" 
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['addresses'] })}
                  >
                    Retry
                  </Button>
                </CardContent>
              </Card>
            ) : addresses.length > 0 ? (
              <div className="space-y-2">
                {addresses.map((address: any) => (
                  <Card key={address.id} className="border-border shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 pt-2 px-3">
                      <div className="space-y-0.5 flex-1">
                        <div className="flex items-center gap-1.5">
                          <CardTitle className="text-xs font-serif font-light">
                            {address.street}
                          </CardTitle>
                          {address.isDefault && (
                            <Badge variant="secondary" className="text-xs h-5">Default</Badge>
                          )}
                        </div>
                        <CardDescription className="text-xs">{address.city}, {address.state}</CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="hover:bg-muted h-7 w-7"
                          onClick={() => handleEditAddress(address)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="hover:bg-destructive/10 h-7 w-7"
                          onClick={() => handleDeleteAddress(address.id)}
                          disabled={deleteAddressMutation.isPending}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="px-3 pb-3">
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        <p>{address.street}</p>
                        <p>{address.city}, {address.state} {address.postalCode}</p>
                        <p>{address.country}</p>
                        <p>Phone: {address.phone}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-border shadow-sm">
                <CardContent className="pt-12 pb-12 text-center">
                  <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground mb-4 text-sm">No addresses found</p>
                  <p className="text-muted-foreground mb-6 text-xs">Add your first address to get started</p>
                </CardContent>
              </Card>
            )}
            
            {/* Add New Address Dialog */}
            <Dialog 
              open={isAddressDialogOpen} 
              onOpenChange={(open) => {
                if (!open) {
                  setIsAddressDialogOpen(false);
                  setEditingAddressId(null);
                  form.reset();
                } else {
                  setIsAddressDialogOpen(true);
                }
              }}
            >
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full h-10 text-xs border-dashed border-2 hover:bg-muted/50 mt-2">
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Add New Address
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingAddressId ? 'Edit Address' : 'Add New Address'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingAddressId 
                      ? 'Update the details for this address'
                      : 'Fill in the details to add a new address'
                    }
                  </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                  <form onSubmit={onSubmitAddress} className="space-y-4">
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
                              <Input placeholder="New York" {...field} />
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
                              <Input placeholder="NY" {...field} />
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
                              <Input placeholder="10001" {...field} />
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
                            <Input placeholder="+91 9876543210" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Is Default Checkbox */}
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
                            <FormLabel>Set as default address</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setIsAddressDialogOpen(false);
                          setEditingAddressId(null);
                          form.reset();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={createAddressMutation.isPending || updateAddressMutation.isPending}
                      >
                        {(createAddressMutation.isPending || updateAddressMutation.isPending) && (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        )}
                        {editingAddressId ? 'Update Address' : 'Add Address'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="orders">
            {ordersLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : error ? (
              <Card className="border-border shadow-sm">
                <CardContent className="pt-12 pb-12 text-center">
                  <p className="text-destructive mb-4 text-xs">Error loading orders</p>
                  <Button variant="outline" className="text-xs" onClick={() => window.location.reload()}>
                    Retry
                  </Button>
                </CardContent>
              </Card>
            ) : orders.length > 0 ? (
              <div className="space-y-2">
                {orders.map((order: any) => (
                  <Card key={order.id} className="border-border shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="pt-3 px-3 pb-3">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-xs">#{order.orderNumber}</h3>
                            <Badge className={`text-xs h-5 ${getStatusColor(order.status)}`}>
                              {order.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p className="text-sm font-serif font-light text-primary">
                              ₹{order.total?.toLocaleString('en-IN') || '0'}
                            </p>
                          </div>
                          <Button 
                            variant="outline" 
                            className="h-8 text-xs px-2 hover:bg-muted"
                            onClick={() => setSelectedOrderId(order.id)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-border shadow-sm">
                <CardContent className="pt-12 pb-12 text-center">
                  <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground mb-4 text-sm">No orders found</p>
                  <p className="text-muted-foreground mb-6 text-xs">Start shopping to see your orders here</p>
                  <Button variant="outline" className="text-xs">
                    <Package className="h-3 w-3 mr-1.5" />
                    Start Shopping
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Order Details Modal */}
      {selectedOrderId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-border shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-4 px-4 sticky top-0 bg-background">
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setSelectedOrderId(null)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <CardTitle className="text-lg font-serif font-light">Order Details</CardTitle>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-6 w-6"
                onClick={() => setSelectedOrderId(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="space-y-4 px-4 pb-4">
              {orderDetailsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : orderDetails?.order ? (
                <>
                  {/* Order Header */}
                  <div className="border-b pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-sm">#{orderDetails.order.orderNumber}</h3>
                      <Badge className={`text-xs h-5 ${getStatusColor(orderDetails.order.status)}`}>
                        {orderDetails.order.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Placed on {new Date(orderDetails.order.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold">Order Items</h4>
                    {orderDetails.order.items && orderDetails.order.items.length > 0 ? (
                      <div className="space-y-2">
                        {orderDetails.order.items.map((item: any) => (
                          <div key={item.id} className="flex items-start gap-3 p-2 bg-muted rounded-md">
                            {item.product?.images?.[0] && (
                              <img 
                                src={item.product.images[0]} 
                                alt={item.product.name}
                                className="w-12 h-12 rounded object-cover"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{item.product?.name || 'Product'}</p>
                              <p className="text-xs text-muted-foreground">Quantity: {item.quantity || 1}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-medium">₹{item.price?.toLocaleString('en-IN') || '0'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">No items in this order</p>
                    )}
                  </div>

                  {/* Order Summary */}
                  <div className="border-t pt-4 space-y-2">
                    <h4 className="text-xs font-semibold">Order Summary</h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span>₹{orderDetails.order.total?.toLocaleString('en-IN') || '0'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Shipping:</span>
                        <span>Free</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-semibold">
                        <span>Total:</span>
                        <span className="text-primary">₹{orderDetails.order.total?.toLocaleString('en-IN') || '0'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Info */}
                  {orderDetails.order.payment && (
                    <div className="border-t pt-4 space-y-2">
                      <h4 className="text-xs font-semibold">Payment Information</h4>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Method:</span>
                          <span className="capitalize">{orderDetails.order.payment.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <span>Completed</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="border-t pt-4 flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1 h-8 text-xs"
                      onClick={() => setSelectedOrderId(null)}
                    >
                      Close
                    </Button>
                    <Button 
                      className="flex-1 h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      Track Order
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-xs text-muted-foreground">Order details not found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MyAccount;