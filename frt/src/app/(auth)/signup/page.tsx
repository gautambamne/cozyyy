'use client'

import { LogoIcon } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useMutation } from '@tanstack/react-query'
import { AuthAction } from '@/api-actions/auth-actions'
import { RegistrationSchema, IRegistrationSchema, IVerifySchema, IResendVerificationCodeSchema } from '@/schema/auth-schema'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useQueryState } from 'nuqs'
import { useState, Suspense } from 'react'
import { z } from 'zod'

// Schema for OTP verification step (only code field)
const OtpVerificationSchema = z.object({
    code: z.string()
        .min(6, 'Verification code must be 6 digits')
        .max(6, 'Verification code must be 6 digits')
        .regex(/^\d{6}$/, 'Verification code must be 6 digits'),
})

function SignupContent() {
    const router = useRouter()
    const [step, setStep] = useQueryState('step', { defaultValue: 'register' })
    const [userEmail, setUserEmail] = useState('')

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        getValues,
    } = useForm<IRegistrationSchema>({
        resolver: zodResolver(RegistrationSchema),
    })

    const {
        register: registerVerify,
        handleSubmit: handleSubmitVerify,
        formState: { errors: verifyErrors, isSubmitting: isVerifySubmitting },
    } = useForm<{ code: string }>({
        resolver: zodResolver(OtpVerificationSchema),
    })

    const registerMutation = useMutation({
        mutationFn: AuthAction.RegisterAction,
        onSuccess: (data) => {
            const email = getValues('email')
            setUserEmail(email)
            toast.success(data.message || 'Registration successful! Please verify your email.')
            setStep('verify')
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Registration failed. Please try again.')
        },
    })

    const verifyMutation = useMutation({
        mutationFn: AuthAction.VerifyAction,
        onSuccess: () => {
            toast.success('Email verified successfully! Please login.')
            router.push('/login')
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Verification failed. Please try again.')
        },
    })

    const resendCodeMutation = useMutation({
        mutationFn: AuthAction.ResendVerificationCodeAction,
        onSuccess: () => {
            toast.success('Verification code resent successfully!')
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to resend code. Please try again.')
        },
    })

    const onSubmit = (data: IRegistrationSchema) => {
        registerMutation.mutate(data)
    }

    const onVerifySubmit = (data: { code: string }) => {
        const payload: IVerifySchema = {
            email: userEmail,
            code: data.code,
        }
        verifyMutation.mutate(payload)
    }

    const handleResendCode = () => {
        if (userEmail) {
            const payload: IResendVerificationCodeSchema = { email: userEmail }
            resendCodeMutation.mutate(payload)
        }
    }

    // Step 2: Verification Form
    if (step === 'verify') {
        return (
            <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
                <form
                    onSubmit={handleSubmitVerify(onVerifySubmit)}
                    className="bg-muted m-auto h-fit w-full max-w-sm overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5 dark:[--color-muted:var(--color-zinc-900)]">
                    <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8 pb-6">
                        <div className="text-center">
                            <Link
                                href="/"
                                aria-label="go home"
                                className="mx-auto block w-fit">
                                <LogoIcon />
                            </Link>
                            <h1 className="mb-1 mt-4 text-xl font-semibold">Verify Your Email</h1>
                            <p className="text-sm">We've sent a verification code to {userEmail}</p>
                        </div>

                        <div className="mt-6 space-y-6">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="code"
                                    className="block text-sm">
                                    Verification Code
                                </Label>
                                <Input
                                    type="text"
                                    placeholder="Enter 6-digit code"
                                    maxLength={6}
                                    {...registerVerify('code')}
                                    className={verifyErrors.code ? 'border-red-500' : ''}
                                />
                                {verifyErrors.code && (
                                    <p className="text-sm text-red-500">{verifyErrors.code.message}</p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isVerifySubmitting || verifyMutation.isPending}
                            >
                                {isVerifySubmitting || verifyMutation.isPending ? 'Verifying...' : 'Verify Email'}
                            </Button>

                            <div className="text-center">
                                <Button
                                    type="button"
                                    variant="link"
                                    onClick={handleResendCode}
                                    disabled={resendCodeMutation.isPending}
                                >
                                    {resendCodeMutation.isPending ? 'Sending...' : 'Resend Code'}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="p-3">
                        <p className="text-accent-foreground text-center text-sm">
                            <Button
                                type="button"
                                variant="link"
                                className="px-2"
                                onClick={() => setStep('register')}>
                                Back to Registration
                            </Button>
                        </p>
                    </div>
                </form>
            </section>
        )
    }

    // Step 1: Registration Form

    // Step 1: Registration Form
    return (
        <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="bg-muted m-auto h-fit w-full max-w-sm overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5 dark:[--color-muted:var(--color-zinc-900)]">
                <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8 pb-6">
                    <div className="text-center">
                        <Link
                            href="/"
                            aria-label="go home"
                            className="mx-auto block w-fit">
                            <LogoIcon />
                        </Link>
                        <h1 className="mb-1 mt-4 text-xl font-semibold">Create a Cozy Girly Account</h1>
                        <p className="text-sm">Welcome! Create an account to get started</p>
                    </div>

                    <div className="mt-6 space-y-6">
                        <div className="space-y-2">
                            <Label
                                htmlFor="name"
                                className="block text-sm">
                                Full Name
                            </Label>
                            <Input
                                type="text"
                                {...register('name')}
                                className={errors.name ? 'border-red-500' : ''}
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500">{errors.name.message}</p>
                            )}
                        </div>
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
                            <Label
                                htmlFor="password"
                                className="text-sm">
                                Password
                            </Label>
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
                            disabled={isSubmitting || registerMutation.isPending}
                        >
                            {isSubmitting || registerMutation.isPending ? 'Creating Account...' : 'Create Account'}
                        </Button>
                    </div>
                </div>

                <div className="p-3">
                    <p className="text-accent-foreground text-center text-sm">
                        Have an account ?
                        <Button
                            asChild
                            variant="link"
                            className="px-2">
                            <Link href="/login">Sign In</Link>
                        </Button>
                    </p>
                </div>
            </form>
        </section>
    )
}

export default function SignupPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
            <SignupContent />
        </Suspense>
    )
}