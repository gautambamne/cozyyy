import "dotenv/config";
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { errorMiddleware } from './middleware/error.middleware'
import authRouter from './router/auth.route'
import sessionRouter from './router/session.route'
import categoryRouter from './router/category.route'
import productRouter from './router/product.route'
import wishlistRouter from './router/wishlist.route'
import cartRouter from './router/cart.route'
import addressRouter from './router/address.route'
import orderRouter from './router/order.routes'
import { StripeWebhookController } from './controllers/payment.controller';
import paymentRouter from "./router/payment.routes";

const app = express();

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

// Stripe webhook route MUST be before express.json() to get raw body
app.post('/api/v1/payments/webhook', express.raw({ type: 'application/json' }), StripeWebhookController);

app.use(express.urlencoded({extended: true}))
app.use(express.json({
    limit: '30kb'
}))
app.use(express.static('public'))
app.use(cookieParser())

// Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/session', sessionRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/wishlist', wishlistRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/addresses', addressRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/payments', paymentRouter);

// Error handling middleware (should be last)
app.use(errorMiddleware);

export default app;