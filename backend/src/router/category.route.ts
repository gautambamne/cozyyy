import { Router } from 'express';
import {
  CreateCategoryController,
  GetAllCategoryController,
  GetCategoryController,
  UpdateCategoryController,
  DeleteCategoryController,
  GetActiveCategoriesController,
} from '../controllers/category.controller';
import { AuthMiddleware } from '../middleware/auth.middlewate';
import { requireRole } from '../middleware/role.middleware';

const categoryRouter = Router();

// Public routes (no authentication required for reading categories)
categoryRouter.get('/', GetAllCategoryController);
categoryRouter.get('/active', GetActiveCategoriesController);
categoryRouter.get('/:id', GetCategoryController);

// Protected routes (authentication required for write operations)
// Note: You may want to add authentication middleware here
categoryRouter.post('/', AuthMiddleware, requireRole(['VENDOR']), CreateCategoryController);
categoryRouter.put('/:id', AuthMiddleware, requireRole(['VENDOR']), UpdateCategoryController);
categoryRouter.delete('/:id', AuthMiddleware, requireRole(['VENDOR']), DeleteCategoryController);

export default categoryRouter;
