import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import * as OrderAction from "@/api-actions/order-actions";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface OrderDetailsDrawerProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderDetailsDrawer({ orderId, isOpen, onClose }: OrderDetailsDrawerProps) {
  // Fetch order details using TanStack Query
  const { data: orderDetails, isLoading } = useQuery<ICreateOrderResponse>({
    queryKey: ['orderDetails', orderId],
    queryFn: async () => {
      return await OrderAction.OrderAction.GetOrderDetailsAction({ id: orderId });
    },
    enabled: isOpen && !!orderId, // Only fetch when drawer is open and orderId exists
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-600';
      case 'confirmed':
        return 'bg-blue-100 text-blue-600';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-600';
      case 'delivered':
        return 'bg-green-100 text-green-600';
      case 'cancelled':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader className="px-6">
          <SheetTitle>Order Details</SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center h-[80vh] px-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : orderDetails?.order ? (
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="space-y-6 py-6 px-6">
              {/* Order Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">#{orderDetails.order.orderNumber}</h3>
                  <Badge 
                    variant="secondary" 
                    className={cn("px-2 py-1", getStatusColor(orderDetails.order.status))}
                  >
                    {orderDetails.order.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Placed on {format(new Date(orderDetails.order.createdAt), "MMM dd, yyyy 'at' hh:mm a")}
                </p>
              </div>

              <Separator />

              {/* Order Items */}
              <div>
                <h4 className="text-sm font-medium mb-3">Order Items</h4>
                <div className="space-y-4">
                  {orderDetails.order.items.map((item: IItemsOrder) => (
                    <div key={item.id} className="flex items-start gap-4">
                      {item.product.images[0] && (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1 space-y-1">
                        <h5 className="font-medium">{item.product.name}</h5>
                        <div className="text-sm text-muted-foreground">
                          <p>Quantity: {item.quantity}</p>
                          <p>Price: ₹{item.price.toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Payment Details */}
              {orderDetails.order.payment && (
                <>
                  <div>
                    <h4 className="text-sm font-medium mb-3">Payment Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Method</span>
                        <span className="font-medium capitalize">{orderDetails.order.payment.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <span className="font-medium capitalize">{orderDetails.order.payment.status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="font-medium">₹{orderDetails.order.payment.amount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Order Summary */}
              <div>
                <h4 className="text-sm font-medium mb-3">Order Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-medium">₹{orderDetails.order.total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        ) : (
          <div className="flex items-center justify-center h-[80vh] px-6">
            <p className="text-muted-foreground">Order details not found</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}