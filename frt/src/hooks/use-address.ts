import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AddressAction } from "@/api-actions/address-actions";
import { ICreateAddressSchema, IUpdateAddressSchema } from "@/schema/address-schema";
import { toast } from "@/hooks/use-toast";

export const useAddress = () => {
  const queryClient = useQueryClient();

  // Get all addresses with pagination
  const useAddresses = (page: string = "1", limit: string = "10") => {
    return useQuery({
      queryKey: ['addresses', page, limit],
      queryFn: () => AddressAction.GetAddressesAction({
        page: parseInt(page),
        limit: parseInt(limit),
        isDefault: false
      }),
    });
  };

  // Get default address
  const useDefaultAddress = () => {
    return useQuery({
      queryKey: ['defaultAddress'],
      queryFn: () => AddressAction.GetDefaultAddressAction(),
    });
  };

  // Get address statistics
  const useAddressStats = () => {
    return useQuery({
      queryKey: ['addressStats'],
      queryFn: () => AddressAction.GetAddressStatsAction(),
    });
  };

  // Get specific address details
  const useAddressDetails = (id: string) => {
    return useQuery({
      queryKey: ['address', id],
      queryFn: () => AddressAction.GetAddressDetailsAction({ id }),
      enabled: !!id,
    });
  };

  // Create new address
  const useCreateAddress = () => {
    return useMutation({
      mutationFn: (data: ICreateAddressSchema) => AddressAction.CreateAddressAction(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['addresses'] });
        toast({
          title: "Success",
          description: "Address created successfully",
        });
      },
      onError: (error: Error) => {
        toast({
          title: "Error",
          description: error.message,
        });
      },
    });
  };

  // Update address
  const useUpdateAddress = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: IUpdateAddressSchema }) =>
        AddressAction.UpdateAddressAction(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['addresses'] });
        toast({
          title: "Success",
          description: "Address updated successfully",
        });
      },
      onError: (error: Error) => {
        toast({
          title: "Error",
          description: error.message,
        });
      },
    });
  };

  // Set address as default
  const useSetDefaultAddress = () => {
    return useMutation({
      mutationFn: ({ id }: { id: string }) => AddressAction.SetDefaultAddressAction({ id }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['addresses'] });
        queryClient.invalidateQueries({ queryKey: ['defaultAddress'] });
        toast({
          title: "Success",
          description: "Default address set successfully",
        });
      },
      onError: (error: Error) => {
        toast({
          title: "Error",
          description: error.message,
        });
      },
    });
  };

  // Delete address
  const useDeleteAddress = () => {
    return useMutation({
      mutationFn: ({ id }: { id: string }) => AddressAction.DeleteAddressAction({ id }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['addresses'] });
        toast({
          title: "Success",
          description: "Address deleted successfully",
        });
      },
      onError: (error: Error) => {
        toast({
          title: "Error",
          description: error.message,
        });
      },
    });
  };

  return {
    useAddresses,
    useDefaultAddress,
    useAddressStats,
    useAddressDetails,
    useCreateAddress,
    useUpdateAddress,
    useSetDefaultAddress,
    useDeleteAddress,
  };
};