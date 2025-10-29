import { z, infer as zodInfer } from 'zod';

// Registration Schema
const RegistrationSchema = z.object({
    name: z.string()
      .min(1, 'Name is required')
      .max(100, 'Name too long')
      .trim(),
    email: z.string()
      .email('Invalid email format')
      .min(1, 'Email is required')
      .max(255, 'Email too long')
      .toLowerCase()
      .trim(),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password too long')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
});

// Login Schema
const LoginSchema = z.object({
    email: z.string()
      .email('Invalid email format')
      .min(1, 'Email is required')
      .toLowerCase()
      .trim(),
    password: z.string()
      .min(1, 'Password is required'),
});

// Verify Schema (for email verification)
const VerifySchema = z.object({
    email: z.string()
      .email('Invalid email format')
      .min(1, 'Email is required')
      .toLowerCase()
      .trim(),
    code: z.string()
      .min(6, 'Verification code must be 6 digits')
      .max(6, 'Verification code must be 6 digits')
      .regex(/^\d{6}$/, 'Verification code must be 6 digits'),
});

// Check Verification Code Schema
const CheckVerificationCodeSchema = z.object({
    email: z.string()
      .email('Invalid email format')
      .min(1, 'Email is required')
      .toLowerCase()
      .trim(),
    code: z.string()
      .min(6, 'Verification code must be 6 digits')
      .max(6, 'Verification code must be 6 digits')
      .regex(/^\d{6}$/, 'Verification code must be 6 digits'),
});

// Forgot Password Schema
const ForgotPasswordSchema = z.object({
    email: z.string()
      .email('Invalid email format')
      .min(1, 'Email is required')
      .toLowerCase()
      .trim(),
});

// Resend Verification Code Schema
const ResendVerificationCodeSchema = z.object({
    email: z.string()
      .email('Invalid email format')
      .min(1, 'Email is required')
      .toLowerCase()
      .trim(),
});

// Reset Password Schema
const ResetPasswordSchema = z.object({
    email: z.string()
      .email('Invalid email format')
      .min(1, 'Email is required')
      .toLowerCase()
      .trim(),
    code: z.string()
      .min(6, 'Verification code must be 6 digits')
      .max(6, 'Verification code must be 6 digits')
      .regex(/^\d{6}$/, 'Verification code must be 6 digits'),
    newPassword: z.string()
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password too long')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
});

type IRegistrationSchema = zodInfer<typeof RegistrationSchema>;
type ILoginSchema = zodInfer<typeof LoginSchema>;
type IVerifySchema = zodInfer<typeof VerifySchema>;
type ICheckVerificationCodeSchema = zodInfer<typeof CheckVerificationCodeSchema>;
type IForgotPasswordSchema = zodInfer<typeof ForgotPasswordSchema>;
type IResendVerificationCodeSchema = zodInfer<typeof ResendVerificationCodeSchema>;
type IResetPasswordSchema = zodInfer<typeof ResetPasswordSchema>;

export type {
    IRegistrationSchema,
    ILoginSchema,
    IVerifySchema,
    ICheckVerificationCodeSchema,
    IForgotPasswordSchema,
    IResendVerificationCodeSchema,
    IResetPasswordSchema
}

export{
    RegistrationSchema,
    LoginSchema,
    VerifySchema,
    CheckVerificationCodeSchema,
    ForgotPasswordSchema,
    ResendVerificationCodeSchema,
    ResetPasswordSchema,
}