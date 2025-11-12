'use client'
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle, Home } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function OrderSuccessPage() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return null
  }

  const orderId = Math.random().toString(36).substring(2, 10).toUpperCase()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6 lg:px-8 py-4">
      <div className="max-w-sm w-full">
        {/* Success Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-5">
          <h1 className="text-2xl font-bold mb-1">Order Confirmed!</h1>
          <p className="text-xs text-muted-foreground">
            Thank you for your purchase.
          </p>
        </div>

        {/* Order ID */}
        <div className="bg-secondary border border-border rounded-lg p-4 mb-5 text-center">
          <p className="text-xs text-muted-foreground mb-1">Order ID</p>
          <p className="text-lg font-bold font-mono">#{orderId}</p>
        </div>

        {/* What Happens Next */}
        <div className="space-y-3 mb-5">
          <h2 className="text-sm font-semibold">What's Next</h2>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 shrink-0 flex items-center justify-center bg-primary text-primary-foreground rounded-full text-xs font-bold">
                1
              </div>
              <div className="text-xs pt-0.5">
                <p className="font-medium">Order Processing</p>
                <p className="text-muted-foreground">We're preparing items</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 shrink-0 flex items-center justify-center bg-primary text-primary-foreground rounded-full text-xs font-bold">
                2
              </div>
              <div className="text-xs pt-0.5">
                <p className="font-medium">Quick Dispatch</p>
                <p className="text-muted-foreground">Within 24-48 hours</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 shrink-0 flex items-center justify-center bg-primary text-primary-foreground rounded-full text-xs font-bold">
                3
              </div>
              <div className="text-xs pt-0.5">
                <p className="font-medium">Track Order</p>
                <p className="text-muted-foreground">Updates via email</p>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-3 gap-2 bg-secondary p-3 rounded-lg mb-4">
          <div className="text-center">
            <div className="text-lg mb-1">📦</div>
            <p className="text-xs font-medium">Free Delivery</p>
          </div>
          <div className="text-center">
            <div className="text-lg mb-1">🔄</div>
            <p className="text-xs font-medium">Easy Returns</p>
          </div>
          <div className="text-center">
            <div className="text-lg mb-1">💳</div>
            <p className="text-xs font-medium">Secure</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 mb-3">
          <Button
            onClick={() => router.push('/')}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 gap-2 text-sm font-semibold"
          >
            <Home size={16} />
            BACK TO HOME
          </Button>
          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="w-full h-10 gap-2 text-sm font-semibold"
          >
            CONTINUE SHOPPING
            <ArrowRight size={16} />
          </Button>
        </div>

        {/* Support Info */}
        <div className="pt-3 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            Need help? <span className="font-medium text-foreground">support@brandora.com</span>
          </p>
        </div>
      </div>
    </div>
  )
}