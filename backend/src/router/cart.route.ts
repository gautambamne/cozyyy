import { Router } from 'express';
import { AuthMiddleware } from '../middleware/auth.middlewate';
import {
    AddToCartController,
    GetCartController,
    GetCartItemByIdController,
    UpdateCartItemController,
    RemoveFromCartController,
    ClearCartController,
} from '../controllers/cart.controller';

const router = Router();

// All cart routes require authentication
router.use(AuthMiddleware);

router.get('/', GetCartController);
router.get('/:id', GetCartItemByIdController);
router.post('/add', AddToCartController);
router.put('/update', UpdateCartItemController);
router.delete('/remove', RemoveFromCartController);
router.delete('/clear', ClearCartController);

export default router;
