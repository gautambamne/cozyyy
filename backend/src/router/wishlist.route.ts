import { Router } from 'express';
import { AuthMiddleware } from '../middleware/auth.middlewate';
import {
    AddToWishlistController,
    GetWishlistController,
    RemoveFromWishlistController,
    ClearWishlistController,
} from '../controllers/wishlist.controller';

const router = Router();

// All wishlist routes require authentication
router.use(AuthMiddleware);

router.get('/', GetWishlistController);
router.post('/add', AddToWishlistController);
router.delete('/remove', RemoveFromWishlistController);
router.delete('/clear', ClearWishlistController);

export default router;
