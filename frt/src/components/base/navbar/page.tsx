'use client'
import Link from 'next/link'
import { Menu, X, LayoutDashboard, LogOut, User } from 'lucide-react'
import React from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AnimatedThemeToggler } from '@/components/ui/theme-button'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import useAuthStore from '@/store/auth-store'
import { AuthAction } from '@/api-actions/auth-actions'

const menuItems = [
    { name: 'Features', href: '#link' },
    { name: 'Solution', href: '#link' },
    { name: 'Pricing', href: '#link' },
    { name: 'About', href: '#link' },
]

export const Navbar = () => {
    const { user, isAuthenticated } = useAuthStore()
    const [menuState, setMenuState] = React.useState(false)
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const isVendor = user?.roles?.includes('VENDOR')
    
    const logoutMutation = useMutation({
        mutationFn: async () => {
            return await AuthAction.LogoutAction()
        },
        onSuccess: () => {
            useAuthStore.getState().setLogout()
            queryClient.clear()
            
            toast({
                title: 'Logged out successfully',
                description: 'You have been logged out of your account.',
            })
        },
        onError: (error: any) => {
            console.error('Logout failed:', error)
            toast({
                title: 'Logout failed',
                description: error?.message || 'An error occurred while logging out.',
            })
        },
    })
    
    const getUserInitials = () => {
        if (!user) return 'U'
        const firstName = user.firstName || user.name?.split(' ')[0] || ''
        const lastName = user.lastName || user.name?.split(' ')[1] || ''
        const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
        return initials || 'U'
    }

    const getUserName = () => {
        if (!user) return 'User'
        return user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'
    }

    const handleLogout = () => {
        logoutMutation.mutate()
    }
    
    React.useEffect(() => {
        console.log('Auth State:', { user, isAuthenticated, roles: user?.roles, isVendor })
    }, [user, isAuthenticated, isVendor])

    return (
        <header>
            <nav
                data-state={menuState && 'active'}
                className="bg-background/50 fixed z-50 w-full border-b backdrop-blur-3xl">
                <div className="mx-auto max-w-6xl px-6 transition-all duration-300">
                    <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
                        {/* Logo and Mobile Menu Toggle */}
                        <div className="flex w-full items-center justify-between gap-12 lg:w-auto">
                            <Link
                                href="/"
                                aria-label="home"
                                className="text-lg font-semibold">
                                Cozy Girlyy
                            </Link>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setMenuState(!menuState)}
                                aria-label={menuState ? 'Close Menu' : 'Open Menu'}
                                className="relative z-20 lg:hidden">
                                <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 size-6 duration-200" />
                                <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute size-6 -rotate-180 scale-0 opacity-0 duration-200" />
                            </Button>

                            {/* Desktop Menu */}
                            <div className="hidden lg:block">
                                <ul className="flex gap-8 text-sm">
                                    {menuItems.map((item, index) => (
                                        <li key={index}>
                                            <Link
                                                href={item.href}
                                                className="text-muted-foreground hover:text-foreground transition-colors">
                                                {item.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Right Side Actions */}
                        <div className="bg-background in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-4 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none">
                            {/* Mobile Menu */}
                            <div className="lg:hidden">
                                <ul className="space-y-6 text-base">
                                    {menuItems.map((item, index) => (
                                        <li key={index}>
                                            <Link
                                                href={item.href}
                                                className="text-muted-foreground hover:text-foreground block transition-colors">
                                                {item.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Theme Toggle */}
                            <AnimatedThemeToggler />

                            {/* Auth Actions */}
                            <div className="flex w-full items-center gap-3 sm:w-fit">
                                {!isAuthenticated ? (
                                    <Link href="/login">
                                        <Button variant="outline" size="sm">
                                            Login
                                        </Button>
                                    </Link>
                                ) : (
                                    <>
                                        {/* Dashboard Button (Vendors Only) */}
                                        {isVendor && (
                                            <Link href="/vendor">
                                                <Button variant="outline" size="sm">
                                                    <LayoutDashboard className="size-4 lg:mr-2" />
                                                    <span className="hidden lg:inline">Dashboard</span>
                                                </Button>
                                            </Link>
                                        )}

                                        {/* User Avatar Dropdown */}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="rounded-full"
                                                    disabled={logoutMutation.isPending}>
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                                                            {getUserInitials()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56">
                                                <DropdownMenuLabel>
                                                    <div className="flex flex-col space-y-1">
                                                        <p className="text-sm font-medium leading-none">{getUserName()}</p>
                                                        <p className="text-xs leading-none text-muted-foreground">
                                                            {user?.email || ''}
                                                        </p>
                                                    </div>
                                                </DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem asChild>
                                                    <Link href="/profile" className="cursor-pointer">
                                                        <User className="mr-2 h-4 w-4" />
                                                        <span>Profile</span>
                                                    </Link>
                                                </DropdownMenuItem>
                                                {isVendor && (
                                                    <DropdownMenuItem asChild className="lg:hidden">
                                                        <Link href="/vendor" className="cursor-pointer">
                                                            <LayoutDashboard className="mr-2 h-4 w-4" />
                                                            <span>Dashboard</span>
                                                        </Link>
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem 
                                                    onClick={handleLogout} 
                                                    disabled={logoutMutation.isPending}
                                                    className="cursor-pointer text-red-600 focus:text-red-600">
                                                    <LogOut className="mr-2 h-4 w-4" />
                                                    <span>{logoutMutation.isPending ? 'Logging out...' : 'Logout'}</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}