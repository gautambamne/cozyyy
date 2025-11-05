"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Settings, LogOut, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AnimatedThemeToggler } from "@/components/ui/theme-button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface Profile {
    name: string;
    email: string;
    avatar?: string;
}

interface MenuItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    className?: string;
}

const DEFAULT_MENU_ITEMS: MenuItem[] = [
    {
        label: "Profile",
        href: "/profile",
        icon: <User className="w-4 h-4" />,
    },
    {
        label: "Settings",
        href: "/settings",
        icon: <Settings className="w-4 h-4" />,
    },
];

interface ProfileDropdownProps extends React.HTMLAttributes<HTMLDivElement> {
    data: Profile;
    showTopbar?: boolean;
    isLoading?: boolean;
    customMenuItems?: MenuItem[];
    onSignOut?: () => void;
}

export default function ProfileDropdown({
    data,
    className,
    isLoading,
    customMenuItems = [],
    onSignOut,
    ...props
}: ProfileDropdownProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    
    // Combine default menu items with custom items
    const menuItems: MenuItem[] = [
        ...DEFAULT_MENU_ITEMS,
        ...customMenuItems,
    ];

    return (
        <div className={cn("relative", className)} {...props}>
            <DropdownMenu onOpenChange={setIsOpen}>
                <div className="relative">
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                            disabled={isLoading}
                        >
                            <Avatar className="h-8 w-8">
                                {data.avatar ? (
                                    <div className="w-full h-full rounded-full overflow-hidden">
                                        <Image
                                            src={data.avatar}
                                            alt={data.name}
                                            width={32}
                                            height={32}
                                            className="object-cover"
                                        />
                                    </div>
                                ) : (
                                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                                        {data.name?.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                )}
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        align="end"
                        sideOffset={4}
                        className="w-64 p-2"
                    >
                        {/* User Info */}
                        <div className="mb-2 px-2 py-1.5">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        {data.name}
                                    </p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {data.email}
                                    </p>
                                </div>
                                <AnimatedThemeToggler />
                            </div>
                        </div>

                        <DropdownMenuSeparator />

                        <div className="space-y-1">
                            {menuItems.map((item) => (
                                <DropdownMenuItem key={item.label} asChild>
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            "flex w-full items-center px-2 py-1.5 text-sm",
                                            item.className
                                        )}
                                    >
                                        {item.icon}
                                        <span className="ml-2">{item.label}</span>
                                    </Link>
                                </DropdownMenuItem>
                            ))}
                        </div>

                        <DropdownMenuSeparator className="my-2" />

                        <DropdownMenuItem
                            onClick={onSignOut}
                            disabled={isLoading}
                            className="text-red-600 focus:text-red-600 cursor-pointer"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>{isLoading ? 'Signing out...' : 'Sign out'}</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </div>
            </DropdownMenu>
        </div>
    );
}
