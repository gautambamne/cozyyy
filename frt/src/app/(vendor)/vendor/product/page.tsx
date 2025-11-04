'use client';

import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, MoreVertical, Edit, Trash2, Plus, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as ProductAction from "@/api-actions/product-actions";
import type { IGetProductsQuerySchema } from "@/schema/product-schema";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';

export default function Page() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(7);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Fetch products with proper types
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', { page: currentPage, limit: itemsPerPage, search: searchQuery, isActive: statusFilter !== 'all' ? statusFilter === 'active' : undefined }],
    queryFn: () => {
      // Build query params
      const params: Partial<IGetProductsQuerySchema> = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery || '',
        isActive: statusFilter !== 'all' ? statusFilter === 'active' : undefined,
        sortBy: "createdAt",
        sortOrder: "desc"
      };
      return ProductAction.ProductAction.GetProductsAction(params);
    }
  });

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => ProductAction.ProductAction.DeleteProductAction({ id }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product deleted successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete product"
      });
    }
  });

  // Calculate metrics from API data
  const metrics = {
    totalProducts: productsData?.pagination.total ?? 0,
    activeProducts: productsData?.products.filter((p) => p.isActive).length ?? 0,
    inactiveProducts: productsData?.products.filter((p) => !p.isActive).length ?? 0,
    lowStockProducts: productsData?.products.filter((p) => p.stock > 0 && p.stock < 20).length ?? 0
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col gap-6 p-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Product Analytics</h1>
          <p className="text-muted-foreground">
            Managing Data for Informed Product Decisions
          </p>
        </div>
        <Button
          className="flex items-center gap-2"
          onClick={() => router.push("/vendor/product/create-product")}
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Total Products</p>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-semibold">{metrics.totalProducts}</h3>
              <div className="text-sm text-green-500">
                {((metrics.activeProducts / metrics.totalProducts) * 100).toFixed(1)}% Active
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Active Products</p>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-semibold">{metrics.activeProducts}</h3>
              <div className="text-sm text-blue-500">
                {metrics.activeProducts} of {metrics.totalProducts}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Inactive Products</p>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-semibold">{metrics.inactiveProducts}</h3>
              <div className="text-sm text-orange-500">
                {((metrics.inactiveProducts / metrics.totalProducts) * 100).toFixed(1)}% Inactive
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Low Stock Alert</p>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-semibold">{metrics.lowStockProducts}</h3>
              <div className="text-sm text-yellow-500">
                {"<"} 20 units
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
            <div className="w-full max-w-sm">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
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
                  <th className="py-3 px-4 text-left font-medium text-muted-foreground">Product Name</th>
                  <th className="py-3 px-4 text-left font-medium text-muted-foreground">Stock</th>
                  <th className="py-3 px-4 text-left font-medium text-muted-foreground">Status</th>
                  <th className="py-3 px-4 text-left font-medium text-muted-foreground">Price</th>
                  <th className="py-3 px-4 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {productsData?.products.map((product) => (
                  <tr key={product.id} className="border-b">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {product.images[0] && (
                          <div className="relative h-10 w-10 rounded-lg overflow-hidden">
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              sizes="40px"
                              className="object-cover"
                              priority={false}
                            />
                          </div>
                        )}
                        <span>{product.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={cn("font-medium", {
                        "text-red-500": product.stock === 0,
                        "text-yellow-500": product.stock > 0 && product.stock < 20,
                        "text-green-500": product.stock >= 20
                      })}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={cn("px-2 py-1 rounded-full text-xs", {
                        "bg-green-100 text-green-600": product.isActive,
                        "bg-red-100 text-red-600": !product.isActive
                      })}>
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 px-4">₹{product.price.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-blue-600"
                            onClick={() => {
                              router.push(`/vendor/product/create-product?id=${product.id}`);
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this product?")) {
                                deleteMutation.mutate(product.id);
                              }
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, productsData?.pagination.total ?? 0)} of {productsData?.pagination.total ?? 0} products
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
              onClick={() => setCurrentPage(page => Math.min(Math.ceil((productsData?.pagination.total ?? 0) / itemsPerPage), page + 1))}
              disabled={currentPage === Math.ceil((productsData?.pagination.total ?? 0) / itemsPerPage) || isLoading}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next page</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}