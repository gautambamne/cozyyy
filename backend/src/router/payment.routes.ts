import { Router } from 'express';
import {
    CreatePaymentIntentController,
    GetPaymentIntentController,
    CreateCheckoutSessionController,
    GetStripeConfigController,
    ConfirmPaymentController
} from '../controllers/payment.controller';
import { AuthMiddleware } from '@/middleware/auth.middlewate';

const paymentRouter = Router();

// Public routes
paymentRouter.get('/config', GetStripeConfigController);

// Note: Webhook route is handled in app.ts before express.json() middleware

// Protected routes
paymentRouter.use(AuthMiddleware); // Apply authentication to all routes below

paymentRouter.post('/create-payment-intent', CreatePaymentIntentController);
paymentRouter.get('/payment-intent/:paymentIntentId', GetPaymentIntentController);
paymentRouter.post('/create-checkout-session', CreateCheckoutSessionController);
paymentRouter.post('/confirm-payment', ConfirmPaymentController);

export default paymentRouter;