"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { Package, ImagePlus, X } from "lucide-react";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import { ProductAction } from "@/api-actions/product-actions";
import { useCategories } from "@/hooks/use-categories";

// Form schema
const ProductFormSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200, 'Product name too long').trim(),
  jewelrySize: z.enum(['SMALL', 'MEDIUM', 'LARGE', 'EXTRA_LARGE', 'CUSTOM']),
  description: z.string().min(1, 'Product description is required').max(2000, 'Product description too long').trim(),
  price: z.number().positive('Price must be greater than 0').max(999999.99, 'Price too high'),
  salePrice: z.number().positive('Sale price must be greater than 0').max(999999.99, 'Sale price too high').optional().nullable(),
  stock: z.number().int('Stock must be a whole number').min(0, 'Stock cannot be negative'),
  categoryId: z.string().uuid('Invalid category ID format'),
  isActive: z.boolean(),
});

type ProductFormValues = z.infer<typeof ProductFormSchema>;

interface Product {
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  categoryId: string;
  isActive: boolean;
  jewelrySize: "SMALL" | "MEDIUM" | "LARGE" | "EXTRA_LARGE" | "CUSTOM";
  salePrice?: number | null;
}

export default function ProductFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');
  const isEditMode = !!productId;

  const queryClient = useQueryClient();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  // State for images
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [isUploadingNewImages, setIsUploadingNewImages] = useState(false);

  // Fetch product data if in edit mode
  const { data: productData, isLoading: productLoading } = useQuery<Product>({
    queryKey: ['product', productId],
    queryFn: async () => {
      const response = await ProductAction.GetProductByIdAction({ id: productId! });
      if (!response?.product) throw new Error('Product not found');
      return response.product as Product;
    },
    enabled: !!productId,
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      isActive: true,
      jewelrySize: "MEDIUM",
      categoryId: "",
      salePrice: null
    },
  });

  // Set form values when product data is loaded
  useEffect(() => {
    if (productData) {
      form.reset({
        name: productData.name,
        description: productData.description,
        price: productData.price,
        stock: productData.stock,
        isActive: productData.isActive,
        jewelrySize: productData.jewelrySize,
        categoryId: productData.categoryId,
        salePrice: productData.salePrice
      });
      setExistingImages(productData.images);
      setPreviewUrls(productData.images);
      setIsUploadingNewImages(false);
    }
  }, [productData, form]);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;
    
    if (files.length > 10) {
      toast.error("Maximum 10 images allowed");
      return;
    }

    // Revoke old blob URLs if any
    previewUrls.forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });

    setSelectedFiles(files);
    setIsUploadingNewImages(true);
    
    // Create preview URLs for new files
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  // Remove image
  const removeImage = (index: number) => {
    if (isUploadingNewImages) {
      // Removing from new files
      const newFiles = selectedFiles.filter((_, i) => i !== index);
      const newUrls = previewUrls.filter((_, i) => i !== index);
      
      // Revoke the removed URL
      if (previewUrls[index].startsWith('blob:')) {
        URL.revokeObjectURL(previewUrls[index]);
      }
      
      setSelectedFiles(newFiles);
      setPreviewUrls(newUrls);

      // If all new images removed, go back to existing images
      if (newFiles.length === 0) {
        setIsUploadingNewImages(false);
        setPreviewUrls(existingImages);
      }
    } else {
      // Cannot remove existing images - user must upload new set
      toast.error("To change images, please upload a new set of images");
    }
  };

  // Cancel new image upload and revert to existing
  const cancelNewImages = () => {
    // Revoke all blob URLs
    previewUrls.forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });

    setSelectedFiles([]);
    setIsUploadingNewImages(false);
    setPreviewUrls(existingImages);
  };

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [previewUrls]);

  // Mutation for create/update
  const mutation = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      if (isEditMode) {
        // Update mode - images are optional
        console.log('Updating product:', {
          id: productId,
          data,
          hasNewImages: isUploadingNewImages,
          newImagesCount: selectedFiles.length
        });

        // Only pass files if user is uploading new images
        if (isUploadingNewImages && selectedFiles.length > 0) {
          return await ProductAction.UpdateProductAction(
            productId!,
            {
              ...data,
              salePrice: data.salePrice ?? undefined
            },
            selectedFiles
          );
        } else {
          // No new images - update without files parameter
          return await ProductAction.UpdateProductAction(
            productId!,
            {
              ...data,
              salePrice: data.salePrice ?? undefined
            }
          );
        }
      } else {
        // Create mode - images are required
        if (selectedFiles.length === 0) {
          throw new Error("At least one image is required");
        }

        console.log('Creating product:', {
          data,
          imagesCount: selectedFiles.length
        });

        return await ProductAction.CreateProductAction(
          {
            ...data,
            salePrice: data.salePrice ?? undefined
          },
          selectedFiles
        );
      }
    },
    onSuccess: () => {
      toast.success(isEditMode ? "Product updated successfully" : "Product created successfully");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      if (productId) {
        queryClient.invalidateQueries({ queryKey: ["product", productId] });
      }
      router.push("/vendor/product");
    },
    onError: (error: any) => {
      console.error('Mutation error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || `Failed to ${isEditMode ? "update" : "create"} product`;
      toast.error(errorMessage);
    },
  });

  // Form submit handler
  const onSubmit = async (data: ProductFormValues) => {
    // Validate images for create mode
    if (!isEditMode && selectedFiles.length === 0) {
      toast.error('At least one image is required');
      return;
    }

    // For edit mode with new images, validate
    if (isEditMode && isUploadingNewImages && selectedFiles.length === 0) {
      toast.error('Please select images or cancel to keep existing images');
      return;
    }

    mutation.mutate(data);
  };

  if (productLoading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Package className="h-8 w-8" />
            {isEditMode ? "Edit Product" : "Create New Product"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isEditMode ? "Update your product information" : "Add a new product to your inventory"}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Enter the essential details about your product</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter product description"
                          className="h-32 resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        disabled={categoriesLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue 
                              placeholder={categoriesLoading ? "Loading categories..." : "Select category"} 
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {!categoriesLoading && categories?.categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Pricing & Inventory */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Inventory</CardTitle>
                <CardDescription>Set pricing and stock information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (₹)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="salePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sale Price (₹)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            step="0.01"
                            placeholder="Optional"
                            value={field.value ?? ""}
                            onChange={e => {
                              const value = e.target.value;
                              field.onChange(value ? parseFloat(value) : null);
                            }}
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
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock Quantity</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="jewelrySize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jewelry Size</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select size" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="SMALL">Small</SelectItem>
                            <SelectItem value="MEDIUM">Medium</SelectItem>
                            <SelectItem value="LARGE">Large</SelectItem>
                            <SelectItem value="EXTRA_LARGE">Extra Large</SelectItem>
                            <SelectItem value="CUSTOM">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Product Images */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImagePlus className="h-5 w-5" />
                  Product Images
                </CardTitle>
                <CardDescription>
                  {isEditMode 
                    ? "Upload new images to replace all existing ones, or keep current images unchanged"
                    : "Upload up to 10 images. First image will be the main display image."
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      className="cursor-pointer flex-1"
                    />
                  </FormControl>
                  
                  {isEditMode && isUploadingNewImages && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={cancelNewImages}
                      size="sm"
                    >
                      Cancel & Keep Current
                    </Button>
                  )}
                </div>
                
                {previewUrls.length > 0 && (
                  <div>
                    {isEditMode && !isUploadingNewImages && (
                      <p className="text-sm text-muted-foreground mb-3">
                        Current images (upload new files to replace)
                      </p>
                    )}
                    {isEditMode && isUploadingNewImages && (
                      <p className="text-sm text-amber-600 mb-3">
                        ⚠ These new images will replace all existing images
                      </p>
                    )}
                    <div className="grid grid-cols-5 gap-3">
                      {previewUrls.map((url, index) => (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-muted group">
                          <Image
                            src={url}
                            alt={`Preview ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          {index === 0 && (
                            <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                              Main
                            </div>
                          )}
                          {isUploadingNewImages && (
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!isEditMode && previewUrls.length === 0 && (
                  <p className="text-sm text-destructive">
                    * At least one image is required
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Product Status */}
            <Card>
              <CardHeader>
                <CardTitle>Product Status</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Status</FormLabel>
                        <FormDescription>
                          Make this product visible to customers
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.push("/vendor/product")}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={mutation.isPending}
              >
                {mutation.isPending 
                  ? isEditMode ? "Updating..." : "Creating..." 
                  : isEditMode ? "Update Product" : "Create Product"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}