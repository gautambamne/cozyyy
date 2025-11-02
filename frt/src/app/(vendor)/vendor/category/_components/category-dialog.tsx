'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

import { CreateCategorySchema, type ICreateCategorySchema } from '@/schema/category-schema';
import { CategoryAction } from '@/api-actions/category-actions';

export function CategoryDialog() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Dialog state from URL
  const dialog = searchParams.get('dialog') ?? '';
  const categoryId = searchParams.get('categoryId') ?? '';
  const isOpen = dialog === 'category';

  // Form setup with proper typing
  const form = useForm<ICreateCategorySchema>({
    resolver: zodResolver(CreateCategorySchema),
    defaultValues: {
      name: '',
      slug: '',
      isActive: true,
    },
  });

  // Fetch category data when editing
  const { data: categoryData } = useQuery({
    queryKey: ['category', categoryId],
    queryFn: () => categoryId ? CategoryAction.GetCategoryAction({ id: categoryId }) : null,
    enabled: !!categoryId,
  });

  // Update form values when editing
  useEffect(() => {
    if (categoryData?.category) {
      form.reset({
        name: categoryData.category.name,
        slug: categoryData.category.slug,
        isActive: categoryData.category.isActive,
      });
    }
  }, [categoryData, form]);

  // Create category mutation
  const createMutation = useMutation({
    mutationFn: CategoryAction.CreateCategoryAction,
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.message || "Category created successfully",
      });
      handleClose();
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create category",
      });
    },
  });

  // Update category mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ICreateCategorySchema }) =>
      CategoryAction.UpdateCategoryAction(id, data),
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.message || "Category updated successfully",
      });
      handleClose();
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update category",
      });
    },
  });

  // Handle form submission with proper typing
  const onSubmit = (values: ICreateCategorySchema) => {
    if (categoryId) {
      updateMutation.mutate({ id: categoryId, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    const slug = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    form.setValue('slug', slug);
  };

  // Close dialog and reset form
  const handleClose = () => {
    form.reset();
    const params = new URLSearchParams(searchParams.toString());
    params.delete('dialog');
    params.delete('categoryId');
    const newQuery = params.toString();
    router.push(newQuery ? `?${newQuery}` : window.location.pathname);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{categoryId ? 'Edit Category' : 'Create Category'}</DialogTitle>
          <DialogDescription>
            {categoryId
              ? 'Update your category details below.'
              : 'Add a new category to organize your products.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Category name"
                      onChange={(e) => {
                        field.onChange(e);
                        handleNameChange(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="category-slug" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Active Status</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Activate or deactivate this category
                    </p>
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

            <DialogFooter>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <>Saving...</>
                ) : (
                  <>{categoryId ? 'Update' : 'Create'}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}