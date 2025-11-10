'use client'

import { useCartStore } from "@/store/cart-store"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Minus, Plus, X } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { useMutation } from "@tanstack/react-query"

export default function CartItems() {
    const { items, updateItem, removeItem } = useCartStore()
    const { toast } = useToast()

    const updateMutation = useMutation({
        mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
            return await updateItem(productId, quantity)
        },
        onError: (error: any) => {
            toast({
                title: 'Error updating cart',
                description: error?.message || 'Something went wrong.',
            })
        }
    })

    const removeMutation = useMutation({
        mutationFn: async (productId: string) => {
            return await removeItem(productId)
        },
        onError: (error: any) => {
            toast({
                title: 'Error removing item',
                description: error?.message || 'Something went wrong.',
            })
        }
    })

    const handleQuantityChange = (productId: string, newQuantity: number) => {
        if (newQuantity < 1) return
        updateMutation.mutate({ productId, quantity: newQuantity })
    }

    const handleRemoveItem = (productId: string) => {
        removeMutation.mutate(productId)
    }

    if (items.length === 0) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center space-y-2">
                <h3 className="text-lg font-medium">Your cart is empty</h3>
                <p className="text-muted-foreground">Add items to your cart to see them here.</p>
            </div>
        )
    }

    return (
        <ScrollArea className="h-[calc(100vh-15rem)] flex-1">
            <div className="p-4 pb-20 space-y-3">
                {items.map((item) => (
                    <div key={item.id} className="flex gap-4 rounded-lg border p-3">
                        {/* Product Image */}
                        <div className="relative aspect-square h-20 w-20 shrink-0 overflow-hidden rounded-md">
                            <Image
                                src={item.product.images[0] || '/placeholder.png'}
                                alt={item.product.name}
                                fill
                                className="object-cover"
                            />
                        </div>

                        {/* Product Details */}
                        <div className="flex flex-1 flex-col justify-between">
                            <div className="space-y-1">
                                <h4 className="font-medium">{item.product.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                    Size: {item.product.jewelrySize}
                                </p>
                                <p className="font-medium">₹{item.product.price}</p>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="size-8"
                                    onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                                    disabled={updateMutation.isPending}>
                                    <Minus className="size-4" />
                                </Button>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="size-8"
                                    onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                                    disabled={updateMutation.isPending}>
                                    <Plus className="size-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Remove Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="self-start shrink-0"
                            onClick={() => handleRemoveItem(item.product.id)}
                            disabled={removeMutation.isPending}>
                            {removeMutation.isPending ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <X className="size-4" />
                            )}
                        </Button>
                    </div>
                ))}
            </div>
        </ScrollArea>
    )
}