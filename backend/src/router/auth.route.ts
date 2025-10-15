import { Router } from 'express';
import {
  RegisterController,
  VerifyUser,
  LoginController,
  ForgotPasswordController,
  ResesndVerificationCodeController,
  CheckVerificationCodeController,
  ResetPasswordController,
  RefreshTokenController,
  LogoutController,
} from '../controllers/auth.controller';

const authRouter = Router();

// Public routes (no authentication required)
authRouter.post('/register', RegisterController);
authRouter.post('/login', LoginController);
authRouter.post('/verify-email', VerifyUser);
authRouter.post('/resend-verification-code', ResesndVerificationCodeController);
authRouter.post('/forgot-password', ForgotPasswordController);
authRouter.post('/check-verification-code', CheckVerificationCodeController);
authRouter.post('/reset-password', ResetPasswordController);

// Protected routes (authentication required - would need middleware)
authRouter.post('/refresh-token', RefreshTokenController);
authRouter.post('/logout', LogoutController);

export default authRouter;
