'use client';

import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery } from "@tanstack/react-query";
import * as OrderAction from "@/api-actions/order-actions";
import { OrderStatus, type IGetOrderQuerySchema, type IOrderListResponseSchema, type IOrderSummarySchema, type IOrderResponseSchema } from "@/schema/order-sceham";
import { OrderDetailsDrawer } from '@/components/dialogs/order/order-details-drawer';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Page() {
  const router = useRouter();
  
  const [statusFilter, setStatusFilter] = useState<keyof typeof OrderStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(7);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);


  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  // Fetch orders with TanStack Query
  const { data: ordersData, isLoading } = useQuery<IOrderListResponseSchema>({
    queryKey: ['orders', { page: currentPage, limit: itemsPerPage, status: statusFilter }],
    queryFn: async () => {
      const params: IGetOrderQuerySchema = {
        page: currentPage,
        limit: itemsPerPage,
        status: statusFilter !== 'all' ? statusFilter as keyof typeof OrderStatus : undefined,
        startDate: undefined,
        endDate: undefined
      };
      const response = await OrderAction.OrderAction.GetOrdersAction(params) as unknown as IOrderListResponseSchema;
      return response;
    }
  });

  // Fetch order summary
  const { data: orderSummary } = useQuery<IOrderSummarySchema>({
    queryKey: ['orderSummary'],
    queryFn: async () => {
      const response = await OrderAction.OrderAction.GetOrderSummaryAction();
      return response.summary;
    }
  });

  const getOrderStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-600';
      case 'processing':
        return 'bg-blue-100 text-blue-600';
      case 'delivered':
        return 'bg-green-100 text-green-600';
      case 'cancelled':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col gap-6 p-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Order Analytics</h1>
          <p className="text-muted-foreground">
            Track and Manage Your Orders Efficiently
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Today's Orders</p>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-semibold">{orderSummary?.todayOrders ?? 0}</h3>
              <div className="text-sm text-blue-500">
                Today
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">This Week</p>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-semibold">{orderSummary?.thisWeekOrders ?? 0}</h3>
              <div className="text-sm text-yellow-500">
                Weekly
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">This Month</p>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-semibold">{orderSummary?.thisMonthOrders ?? 0}</h3>
              <div className="text-sm text-green-500">
                Monthly
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Total Orders</p>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-semibold">{orderSummary?.total ?? 0}</h3>
              <div className="text-sm text-purple-500">
                All Time
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        {/* Table Actions */}
        <div className="px-4 py-2 border-b">
          <div className="flex items-center gap-3">
            <Select 
              value={statusFilter} 
              onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}
            >
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="SHIPPED">Shipped</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4 text-left font-medium text-muted-foreground">Order Number</th>
                  <th className="py-3 px-4 text-left font-medium text-muted-foreground">Status</th>
                  <th className="py-3 px-4 text-left font-medium text-muted-foreground">Items</th>
                  <th className="py-3 px-4 text-left font-medium text-muted-foreground">Total Amount</th>
                  <th className="py-3 px-4 text-left font-medium text-muted-foreground">Payment Method</th>
                  <th className="py-3 px-4 text-left font-medium text-muted-foreground">Created At</th>
                </tr>
              </thead>
              <tbody>
                {ordersData?.orders?.map((order) => (
                  <tr 
                    key={order.id} 
                    className="border-b hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedOrderId(order.id)}
                  >
                    <td className="py-3 px-4">
                      #{order.orderNumber}
                    </td>
                    <td className="py-3 px-4">
                      <span className={cn("px-2 py-1 rounded-full text-xs", getOrderStatusStyle(order.status))}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm">
                        {order.items.length} items
                        {order.items[0] && (
                          <span className="block text-xs text-muted-foreground truncate max-w-[200px]">
                            {order.items[0]?.product?.name || 'Product'}
                            {order.items.length > 1 ? ` + ${order.items.length - 1} more` : ''}
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      ₹{order.total.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <span className="capitalize text-sm">
                        {order.payment?.paymentMethod || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="px-4 py-1 border-t flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing page {currentPage} of {ordersData?.pagination?.totalPages ?? 1}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
              disabled={currentPage === 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous page</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentPage(page => page + 1)}
              disabled={currentPage >= (ordersData?.pagination?.totalPages ?? 1) || isLoading}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next page</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Order Details Drawer */}
      <OrderDetailsDrawer
        orderId={selectedOrderId || ''}
        isOpen={!!selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
      />
    </div>
  );
}
