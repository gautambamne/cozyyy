import { Router } from 'express';
import {
    CreatePaymentIntentController,
    GetPaymentIntentController,
    CreateCheckoutSessionController,
    StripeWebhookController,
    GetStripeConfigController
} from '../controllers/payment.controller';
import { AuthMiddleware } from '@/middleware/auth.middlewate';

const paymentRouter = Router();

// Public routes
paymentRouter.get('/config', GetStripeConfigController);

// Webhook route (must be before body parser middleware)
paymentRouter.post('/webhook', StripeWebhookController);

// Protected routes
paymentRouter.use(AuthMiddleware); // Apply authentication to all routes below

paymentRouter.post('/create-payment-intent', CreatePaymentIntentController);
paymentRouter.get('/payment-intent/:paymentIntentId', GetPaymentIntentController);
paymentRouter.post('/create-checkout-session', CreateCheckoutSessionController);

export default paymentRouter;
