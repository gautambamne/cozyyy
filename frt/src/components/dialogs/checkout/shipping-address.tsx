import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateAddressSchema, ICreateAddressSchema } from "@/schema/address-schema";
import { useAddress } from "@/hooks/use-address";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, MoreVertical, Pencil, Trash2, Plus, X } from "lucide-react";

interface ShippingAddressProps {
  onAddressSelect: (address: {
    id: string;
    userId: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
  }) => void;
  selectedAddressId?: string;
}

export function ShippingAddress({ onAddressSelect, selectedAddressId }: ShippingAddressProps) {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const { useAddresses, useCreateAddress, useUpdateAddress, useDeleteAddress } = useAddress();
  
  const { data: addressData, isLoading: isLoadingAddresses } = useAddresses("1", "10");
  const { mutate: createAddress, isPending: isCreating } = useCreateAddress();
  const { mutate: updateAddress, isPending: isUpdating } = useUpdateAddress();
  const { mutate: deleteAddress } = useDeleteAddress();

  const form = useForm({
    resolver: zodResolver(CreateAddressSchema),
    defaultValues: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
      phone: "",
      isDefault: false,
    } as ICreateAddressSchema,
  });

  const onSubmit = form.handleSubmit((data) => {
    if (editingAddressId) {
      updateAddress(
        { id: editingAddressId, data: data as ICreateAddressSchema },
        {
          onSuccess: (response) => {
            setEditingAddressId(null);
            setIsAddingNew(false);
            if (response.address) {
              onAddressSelect(response.address);
            }
            form.reset();
          },
        }
      );
    } else {
      createAddress(data as ICreateAddressSchema, {
        onSuccess: (response) => {
          setIsAddingNew(false);
          if (response.address) {
            onAddressSelect(response.address);
          }
          form.reset();
        },
      });
    }
  });

  const handleEdit = (address: any) => {
    setEditingAddressId(address.id);
    setIsAddingNew(true);
    form.reset({
      street: address.street,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone,
      isDefault: address.isDefault,
    });
  };

  const handleDelete = (addressId: string) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      deleteAddress({ id: addressId });
    }
  };

  const handleCancel = () => {
    setIsAddingNew(false);
    setEditingAddressId(null);
    form.reset();
  };

  if (isLoadingAddresses) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  const addresses = addressData?.addresses || [];
  const hasAddresses = addresses.length > 0;

  return (
    <div className="flex flex-col w-full bg-background rounded-lg">
      {/* Header Section - Compact */}
      <div className="flex items-center justify-between py-4 px-6 border-b">
        <div>
          <h3 className="text-lg font-semibold">
            Shipping address
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isAddingNew 
              ? (editingAddressId ? "Edit Address" : "Add New Address")
              : "Select Shipping Address"
            }
          </p>
        </div>
        {!isAddingNew && hasAddresses && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsAddingNew(true)}
            className="gap-1.5 h-9 text-sm border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add New
          </Button>
        )}
        {isAddingNew && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            className="h-8 w-8 hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Scrollable Content Area - Compact Cards */}
      <ScrollArea className="h-[340px] w-full">
        <div className="p-4">
          {/* Address List View - Compact Card Style */}
          {!isAddingNew && hasAddresses && (
            <RadioGroup
              value={selectedAddressId}
              onValueChange={(value) => {
                const address = addresses.find((a) => a.id === value);
                if (address) onAddressSelect(address);
              }}
              className="space-y-3"
            >
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className={`relative p-3.5 border-2 rounded-lg transition-all cursor-pointer hover:shadow-sm ${
                    selectedAddressId === address.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <RadioGroupItem 
                      value={address.id} 
                      id={address.id} 
                      className="mt-0.5 shrink-0"
                    />
                    <Label
                      htmlFor={address.id}
                      className="flex-1 cursor-pointer min-w-0"
                    >
                      <div className="space-y-0.5">
                        <div className="font-medium text-sm line-clamp-1">
                          {address.street}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {address.city}, {address.state}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {address.country} {address.postalCode}
                        </div>
                        <div className="text-xs font-medium pt-0.5">
                          {address.phone}
                        </div>
                      </div>
                    </Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 hover:bg-gray-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-32">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(address);
                          }}
                          className="cursor-pointer text-sm"
                        >
                          <Pencil className="mr-2 h-3.5 w-3.5" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(address.id);
                          }}
                          className="text-red-600 cursor-pointer focus:text-red-600 text-sm"
                        >
                          <Trash2 className="mr-2 h-3.5 w-3.5" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </RadioGroup>
          )}

          {/* Add/Edit Form - Compact Layout */}
          {isAddingNew && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="street" className="text-xs font-medium mb-1.5 block">
                  Street Address
                </Label>
                <Input
                  id="street"
                  {...form.register("street")}
                  placeholder="House/Flat No, Building, Street"
                  className="h-10 text-sm"
                />
                {form.formState.errors.street?.message && (
                  <span className="text-xs text-red-600 mt-1 block">
                    {form.formState.errors.street.message}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="country" className="text-xs font-medium text-gray-700 mb-1.5 block">
                    Country
                  </Label>
                  <Input
                    id="country"
                    {...form.register("country")}
                    placeholder="Country"
                    className="h-10 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  {form.formState.errors.country?.message && (
                    <span className="text-xs text-red-600 mt-1 block">
                      {form.formState.errors.country.message}
                    </span>
                  )}
                </div>

                <div>
                  <Label htmlFor="state" className="text-xs font-medium text-gray-700 mb-1.5 block">
                    State
                  </Label>
                  <Input
                    id="state"
                    {...form.register("state")}
                    placeholder="State"
                    className="h-10 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  {form.formState.errors.state?.message && (
                    <span className="text-xs text-red-600 mt-1 block">
                      {form.formState.errors.state.message}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="city" className="text-xs font-medium text-gray-700 mb-1.5 block">
                    City
                  </Label>
                  <Input
                    id="city"
                    {...form.register("city")}
                    placeholder="City"
                    className="h-10 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  {form.formState.errors.city?.message && (
                    <span className="text-xs text-red-600 mt-1 block">
                      {form.formState.errors.city.message}
                    </span>
                  )}
                </div>

                <div>
                  <Label htmlFor="postalCode" className="text-xs font-medium text-gray-700 mb-1.5 block">
                    PIN Code
                  </Label>
                  <Input
                    id="postalCode"
                    {...form.register("postalCode")}
                    placeholder="PIN code"
                    maxLength={6}
                    className="h-10 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  {form.formState.errors.postalCode?.message && (
                    <span className="text-xs text-red-600 mt-1 block">
                      {form.formState.errors.postalCode.message}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="phone" className="text-xs font-medium text-gray-700 mb-1.5 block">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  {...form.register("phone")}
                  placeholder="10-digit phone"
                  maxLength={10}
                  className="h-10 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                {form.formState.errors.phone?.message && (
                  <span className="text-xs text-red-600 mt-1 block">
                    {form.formState.errors.phone.message}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <Checkbox
                  checked={form.watch("isDefault")}
                  onCheckedChange={(checked) => form.setValue("isDefault", checked as boolean)}
                  id="isDefault"
                  className="border-gray-300"
                />
                <Label htmlFor="isDefault" className="text-xs text-gray-700 cursor-pointer font-normal">
                  Save this information for next time
                </Label>
              </div>
            </div>
          )}

          {/* Empty State - Compact */}
          {!isAddingNew && !hasAddresses && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mb-3">
                <svg className="w-7 h-7 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-muted-foreground text-sm mb-4">No addresses found</p>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddingNew(true)}
                className="gap-1.5 text-sm hover:bg-accent"
              >
                <Plus className="h-3.5 w-3.5" />
                Add New Address
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Fixed Bottom Button - Always Visible */}
      <div className="border-t bg-background px-6 py-3 flex justify-end">
        {!isAddingNew && hasAddresses && (
          <Button
            type="button"
            variant="default"
            size="sm"
            className="w-40"
            disabled={!selectedAddressId}
            onClick={() => {
              const address = addresses.find((a) => a.id === selectedAddressId);
              if (address) onAddressSelect(address);
            }}
          >
            <span className="text-sm">Continue to Payment</span>
          </Button>
        )}

        {isAddingNew && (
          <Button
            type="button"
            onClick={onSubmit}
            disabled={isCreating || isUpdating}
            variant="default"
            size="sm"
            className="w-40"
          >
            {isCreating || isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span className="text-sm">{editingAddressId ? "Updating..." : "Saving..."}</span>
              </>
            ) : (
              <span className="text-sm">{editingAddressId ? "Update & Continue" : "Save & Continue"}</span>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}