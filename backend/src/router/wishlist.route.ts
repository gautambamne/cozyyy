import { Router } from 'express';
import { AuthMiddleware } from '../middleware/aurth.middlewate';
import {
    AddToWishlistController,
    GetWishlistController,
    RemoveFromWishlistController,
    ClearWishlistController,
} from '../controllers/wishlist.controller';

const router = Router();

// All wishlist routes require authentication
router.use(AuthMiddleware);

// Get user's wishlist with pagination and sorting
router.get('/', GetWishlistController);

// Add item to wishlist
router.post('/add', AddToWishlistController);

// Remove single item from wishlist
router.delete('/remove', RemoveFromWishlistController);

// Bulk operations
router.delete('/clear', ClearWishlistController);

export default router;
