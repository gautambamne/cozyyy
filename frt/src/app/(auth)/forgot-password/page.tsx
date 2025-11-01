'use client'

import { LogoIcon } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useMutation } from '@tanstack/react-query'
import { AuthAction } from '@/api-actions/auth-actions'
import {
    IForgotPasswordSchema,
    ICheckVerificationCodeSchema,
    IResetPasswordSchema,
    ForgotPasswordSchema,
} from '@/schema/auth-schema'
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

// Schema for reset password step (only password field)
const NewPasswordSchema = z.object({
    newPassword: z.string()
        .min(8, 'Password must be at least 8 characters')
        .max(100, 'Password too long')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
})

function ForgotPasswordContent() {
    const router = useRouter()
    const [step, setStep] = useQueryState('step', { defaultValue: 'email' })
    const [userEmail, setUserEmail] = useState('')
    const [verificationCode, setVerificationCode] = useState('')

    // Step 1: Email form
    const {
        register: registerEmail,
        handleSubmit: handleSubmitEmail,
        formState: { errors: emailErrors, isSubmitting: isEmailSubmitting },
        getValues: getEmailValues,
    } = useForm<IForgotPasswordSchema>({
        resolver: zodResolver(ForgotPasswordSchema),
    })

    // Step 2: OTP verification form
    const {
        register: registerOtp,
        handleSubmit: handleSubmitOtp,
        formState: { errors: otpErrors, isSubmitting: isOtpSubmitting },
    } = useForm<{ code: string }>({
        resolver: zodResolver(OtpVerificationSchema),
    })

    // Step 3: New password form
    const {
        register: registerPassword,
        handleSubmit: handleSubmitPassword,
        formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
    } = useForm<{ newPassword: string }>({
        resolver: zodResolver(NewPasswordSchema),
    })

    // Mutation for sending forgot password email
    const forgotPasswordMutation = useMutation({
        mutationFn: AuthAction.ForgotPasswordAction,
        onSuccess: () => {
            const email = getEmailValues('email')
            setUserEmail(email)
            toast.success('Verification code sent to your email!')
            setStep('verify')
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to send verification code.')
        },
    })

    // Mutation for verifying OTP code
    const verifyCodeMutation = useMutation({
        mutationFn: AuthAction.CheckVerificationCodeAction,
        onSuccess: () => {
            toast.success('Code verified! Now set your new password.')
            setStep('reset')
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Invalid verification code.')
        },
    })

    // Mutation for resetting password
    const resetPasswordMutation = useMutation({
        mutationFn: AuthAction.ResetPasswordAction,
        onSuccess: () => {
            toast.success('Password reset successful! Please login.')
            router.push('/login')
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to reset password.')
        },
    })

    // Step 1: Submit email
    const onEmailSubmit = (data: IForgotPasswordSchema) => {
        forgotPasswordMutation.mutate(data)
    }

    // Step 2: Submit OTP
    const onOtpSubmit = (data: { code: string }) => {
        setVerificationCode(data.code)
        const payload: ICheckVerificationCodeSchema = {
            email: userEmail,
            code: data.code,
        }
        verifyCodeMutation.mutate(payload)
    }

    // Step 3: Submit new password
    const onPasswordSubmit = (data: { newPassword: string }) => {
        const payload: IResetPasswordSchema = {
            email: userEmail,
            code: verificationCode,
            newPassword: data.newPassword,
        }
        resetPasswordMutation.mutate(payload)
    }

    // Step 2: OTP Verification
    if (step === 'verify') {
        return (
            <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
                <form
                    onSubmit={handleSubmitOtp(onOtpSubmit)}
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
                                <Label htmlFor="code" className="block text-sm">
                                    Verification Code
                                </Label>
                                <Input
                                    type="text"
                                    placeholder="Enter 6-digit code"
                                    maxLength={6}
                                    {...registerOtp('code')}
                                    className={otpErrors.code ? 'border-red-500' : ''}
                                />
                                {otpErrors.code && (
                                    <p className="text-sm text-red-500">{otpErrors.code.message}</p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isOtpSubmitting || verifyCodeMutation.isPending}>
                                {isOtpSubmitting || verifyCodeMutation.isPending
                                    ? 'Verifying...'
                                    : 'Verify Code'}
                            </Button>

                            <div className="text-center">
                                <Button
                                    type="button"
                                    variant="link"
                                    onClick={() => setStep('email')}>
                                    Back to Email
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="p-3">
                        <p className="text-accent-foreground text-center text-sm">
                            Remember your password?
                            <Button asChild variant="link" className="px-2">
                                <Link href="/login">Sign In</Link>
                            </Button>
                        </p>
                    </div>
                </form>
            </section>
        )
    }

    // Step 3: Reset Password
    if (step === 'reset') {
        return (
            <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
                <form
                    onSubmit={handleSubmitPassword(onPasswordSubmit)}
                    className="bg-muted m-auto h-fit w-full max-w-sm overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5 dark:[--color-muted:var(--color-zinc-900)]">
                    <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8 pb-6">
                        <div className="text-center">
                            <Link
                                href="/"
                                aria-label="go home"
                                className="mx-auto block w-fit">
                                <LogoIcon />
                            </Link>
                            <h1 className="mb-1 mt-4 text-xl font-semibold">Reset Your Password</h1>
                            <p className="text-sm">Enter your new password</p>
                        </div>

                        <div className="mt-6 space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="newPassword" className="block text-sm">
                                    New Password
                                </Label>
                                <Input
                                    type="password"
                                    {...registerPassword('newPassword')}
                                    className={passwordErrors.newPassword ? 'border-red-500' : ''}
                                />
                                {passwordErrors.newPassword && (
                                    <p className="text-sm text-red-500">
                                        {passwordErrors.newPassword.message}
                                    </p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isPasswordSubmitting || resetPasswordMutation.isPending}>
                                {isPasswordSubmitting || resetPasswordMutation.isPending
                                    ? 'Resetting...'
                                    : 'Reset Password'}
                            </Button>
                        </div>
                    </div>

                    <div className="p-3">
                        <p className="text-accent-foreground text-center text-sm">
                            Remember your password?
                            <Button asChild variant="link" className="px-2">
                                <Link href="/login">Sign In</Link>
                            </Button>
                        </p>
                    </div>
                </form>
            </section>
        )
    }

    // Step 1: Email Form (Default)
    return (
        <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
            <form
                onSubmit={handleSubmitEmail(onEmailSubmit)}
                className="bg-muted m-auto h-fit w-full max-w-sm overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5 dark:[--color-muted:var(--color-zinc-900)]">
                <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8 pb-6">
                    <div className="text-center">
                        <Link
                            href="/"
                            aria-label="go home"
                            className="mx-auto block w-fit">
                            <LogoIcon />
                        </Link>
                        <h1 className="mb-1 mt-4 text-xl font-semibold">Forgot Password?</h1>
                        <p className="text-sm">Enter your email to receive a verification code</p>
                    </div>

                    <div className="mt-6 space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="block text-sm">
                                Email
                            </Label>
                            <Input
                                type="email"
                                {...registerEmail('email')}
                                className={emailErrors.email ? 'border-red-500' : ''}
                            />
                            {emailErrors.email && (
                                <p className="text-sm text-red-500">{emailErrors.email.message}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isEmailSubmitting || forgotPasswordMutation.isPending}>
                            {isEmailSubmitting || forgotPasswordMutation.isPending
                                ? 'Sending...'
                                : 'Send Verification Code'}
                        </Button>
                    </div>
                </div>

                <div className="p-3">
                    <p className="text-accent-foreground text-center text-sm">
                        Remember your password?
                        <Button asChild variant="link" className="px-2">
                            <Link href="/login">Sign In</Link>
                        </Button>
                    </p>
                </div>
            </form>
        </section>
    )
}

export default function ForgotPasswordPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
            <ForgotPasswordContent />
        </Suspense>
    )
}
