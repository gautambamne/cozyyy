
'use client';

import CardStack from "@/components/kokonutui/card-stack";
import { Card } from "@/components/ui/card";

export default function PaymentPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col gap-6 p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Payment Methods</h1>
        <p className="text-muted-foreground">
          Manage your payment methods and transactions
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Left side - Summary */}
        <div className="flex flex-col gap-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold">Payment Summary</h2>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Revenue</span>
                <span className="font-medium">$12,345</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pending Payouts</span>
                <span className="font-medium">$2,450</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Available Balance</span>
                <span className="font-medium">$9,895</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold">Recent Transactions</h2>
            <div className="mt-4 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="flex flex-col">
                    <span className="font-medium">Order #{i}234</span>
                    <span className="text-sm text-muted-foreground">2 hours ago</span>
                  </div>
                  <span className="font-medium text-green-600">+$149.99</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right side - Card Stack */}
        <div className="flex items-center justify-center">
          <div className="h-[500px] w-full max-w-md">
            <CardStack />
          </div>
        </div>
      </div>
    </div>
  )
}
