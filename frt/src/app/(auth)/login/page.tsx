'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useMutation } from '@tanstack/react-query'
import { AuthAction } from '@/api-actions/auth-actions'
import { LoginSchema, ILoginSchema } from '@/schema/auth-schema'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import useAuthStore from '@/store/auth-store'

export default function LoginPage() {
    const router = useRouter()
    const { setLogin } = useAuthStore()

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ILoginSchema>({
        resolver: zodResolver(LoginSchema),
    })

    const loginMutation = useMutation({
        mutationFn: AuthAction.LoginAction,
        onSuccess: (data) => {
            setLogin(data)
            toast.success('Login successful!')
            router.push('/')
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Login failed. Please try again.')
        },
    })

    const onSubmit = (data: ILoginSchema) => {
        loginMutation.mutate(data)
    }

    return (
        <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="bg-card m-auto h-fit w-full max-w-sm rounded-[calc(var(--radius)+.125rem)] border p-0.5 shadow-md dark:[--color-muted:var(--color-zinc-900)]">
                <div className="p-8 pb-6">
                    <div>
                        <Link
                            href="/"
                            aria-label="go home">
                        </Link>
                        <h1 className="mb-1 mt-4 text-xl font-semibold">Sign In to Tailark</h1>
                        <p className="text-sm">Welcome back! Sign in to continue</p>
                    </div>

                    <hr className="my-4 border-dashed" />

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label
                                htmlFor="email"
                                className="block text-sm">
                                Email
                            </Label>
                            <Input
                                type="email"
                                {...register('email')}
                                className={errors.email ? 'border-red-500' : ''}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-0.5">
                            <div className="flex items-center justify-between">
                                <Label
                                    htmlFor="password"
                                    className="text-sm">
                                    Password
                                </Label>
                                <Button
                                    asChild
                                    variant="link"
                                    size="sm">
                                    <Link
                                        href="#"
                                        className="link intent-info variant-ghost text-sm">
                                        Forgot your Password ?
                                    </Link>
                                </Button>
                            </div>
                            <Input
                                type="password"
                                {...register('password')}
                                className={errors.password ? 'border-red-500' : ''}
                            />
                            {errors.password && (
                                <p className="text-sm text-red-500">{errors.password.message}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isSubmitting || loginMutation.isPending}
                        >
                            {isSubmitting || loginMutation.isPending ? 'Signing In...' : 'Sign In'}
                        </Button>
                    </div>
                </div>

                <div className="bg-muted rounded-lg border p-3">
                    <p className="text-accent-foreground text-center text-sm">
                        Don't have an account?
                        <Button
                            asChild
                            variant="link"
                            className="px-2">
                            <Link href="/signup">Create account</Link>
                        </Button>
                    </p>
                </div>
            </form>
        </section>
    )
}