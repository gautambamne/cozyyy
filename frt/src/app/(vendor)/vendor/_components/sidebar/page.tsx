"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  List,
  Package2, 
  ShoppingBag, 
  Wallet, 
  Settings 
} from "lucide-react";

const menuItems = [
  {
    title: "Category",
    href: "/vendor/category",
    icon: List,
  },
  {
    title: "Product",
    href: "/vendor/product",
    icon: Package2,
  },
  {
    title: "Order",
    href: "/vendor/order",
    icon: ShoppingBag,
  },
  {
    title: "Payment",
    href: "/vendor/payment",
    icon: Wallet,
  },
  {
    title: "Settings",
    href: "/vendor/settings",
    icon: Settings,
  },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-full flex-col">
      {/* Header */}
      <div className="flex h-14 items-center border-b px-4">
        <h2 className="text-lg font-semibold">Dashboard</h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 py-3 px-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-in-out",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}