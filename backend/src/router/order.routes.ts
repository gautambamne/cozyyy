import { Router } from 'express';
import { AuthMiddleware } from '../middleware/auth.middlewate';
import { requireRole } from '../middleware/role.middleware';
import {
    CreateOrderController,
    GetOrdersController,
    GetOrderDetailsController,
    UpdateOrderStatusController,
    UpdatePaymentStatusController,
    GetOrderStatsController,
    GetRecentOrdersController
} from '../controllers/order.controller';

const router = Router();

// All order routes require authentication
router.use(AuthMiddleware);

// Customer routes - Cart to Order
router.post('/create', CreateOrderController);

// Order Listing & Details
router.get('/', GetOrdersController);
router.get('/recent', GetRecentOrdersController);
router.get('/:id', GetOrderDetailsController);

// Stats and Analytics (Vendor only)
router.get('/stats/overview', requireRole(['VENDOR']), GetOrderStatsController);

// Order Management (Vendor only)
router.patch('/:id/status', requireRole(['VENDOR']), UpdateOrderStatusController);
router.patch('/:id/payment', requireRole(['VENDOR']), UpdatePaymentStatusController);

export default router;
