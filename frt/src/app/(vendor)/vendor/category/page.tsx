'use client';

import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { Search, MoreVertical, Edit, Trash2, Plus, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as CategoryAction from "@/api-actions/category-actions";
import type { ICategory } from "@/types/category";
import axiosInstance from "@/lib/axios-insterceptor";
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
import { CategoryDialog } from './_components/category-dialog';

const Page = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(7);

  // Handle filtering through API query parameters
  useEffect(() => {
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Fetch categories
  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ['categories', { page: currentPage, limit: itemsPerPage, search: searchQuery, isActive: statusFilter !== 'all' ? statusFilter === 'active' : undefined }],
    queryFn: () => CategoryAction.CategoryAction.GetCategoriesAction({
      page: currentPage,
      limit: itemsPerPage,
      search: searchQuery || '',
      isActive: statusFilter !== 'all' ? statusFilter === 'active' : undefined
    })
  });

  // Delete category mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => axiosInstance.delete(`/categories/${id}`),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Category deleted successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete category"
      });
    }
  });

  // Calculate metrics from API data
  const metrics = {
    totalCategories: categoriesData?.pagination.total ?? 0,
    activeCategories: categoriesData?.categories.filter((c: ICategory) => c.isActive).length ?? 0,
    inactiveCategories: categoriesData?.categories.filter((c: ICategory) => !c.isActive).length ?? 0
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col gap-6 p-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Category Analytics</h1>
          <p className="text-muted-foreground">
            Managing Data for Informed Product Decisions
          </p>
        </div>
        <Button
          className="flex items-center gap-2"
          onClick={() => {
            const params = new URLSearchParams(window.location.search);
            params.set('dialog', 'category');
            router.push(`?${params.toString()}`);
          }}
        >
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Category Dialog */}
      <CategoryDialog />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Total Categories</p>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-semibold">{metrics.totalCategories}</h3>
              <div className="text-sm text-green-500">
                {((metrics.activeCategories / metrics.totalCategories) * 100).toFixed(1)}% Active
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Active Categories</p>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-semibold">{metrics.activeCategories}</h3>
              <div className="text-sm text-blue-500">
                {metrics.activeCategories} of {metrics.totalCategories}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Inactive Categories</p>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-semibold">{metrics.inactiveCategories}</h3>
              <div className="text-sm text-orange-500">
                {((metrics.inactiveCategories / metrics.totalCategories) * 100).toFixed(1)}% Inactive
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
                  placeholder="Search categories..."
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
                  <th className="py-3 px-4 text-left font-medium text-muted-foreground">Category Name</th>
                  <th className="py-3 px-4 text-left font-medium text-muted-foreground">Slug</th>
                  <th className="py-3 px-4 text-left font-medium text-muted-foreground">Status</th>
                  <th className="py-3 px-4 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categoriesData?.categories.map((category) => (
                  <tr key={category.id} className="border-b">
                    <td className="py-3 px-4">{category.name}</td>
                    <td className="py-3 px-4">{category.slug}</td>
                    <td className="py-3 px-4">
                      <span className={cn("px-2 py-1 rounded-full text-xs", {
                        "bg-green-100 text-green-600": category.isActive,
                        "bg-red-100 text-red-600": !category.isActive
                      })}>
                        {category.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
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
                              const params = new URLSearchParams(window.location.search);
                              params.set('dialog', 'category');
                              params.set('categoryId', category.id);
                              router.push(`?${params.toString()}`);
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this category?")) {
                                deleteMutation.mutate(category.id);
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
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, categoriesData?.pagination.total ?? 0)} of {categoriesData?.pagination.total ?? 0} categories
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
              onClick={() => setCurrentPage(page => Math.min(Math.ceil((categoriesData?.pagination.total ?? 0) / itemsPerPage), page + 1))}
              disabled={currentPage === Math.ceil((categoriesData?.pagination.total ?? 0) / itemsPerPage) || isLoading}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next page</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Page;