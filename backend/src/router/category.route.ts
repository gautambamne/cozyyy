import { Router } from 'express';
import {
  CreateCategoryController,
  GetAllCategoryController,
  GetCategoryController,
  UpdateCategoryController,
  DeleteCategoryController,
  GetActiveCategoriesController,
} from '../controllers/category.controller';

const categoryRouter = Router();

// Public routes (no authentication required for reading categories)
categoryRouter.get('/', GetAllCategoryController);
categoryRouter.get('/active', GetActiveCategoriesController);
categoryRouter.get('/:id', GetCategoryController);

// Protected routes (authentication required for write operations)
// Note: You may want to add authentication middleware here
categoryRouter.post('/', CreateCategoryController);
categoryRouter.put('/:id', UpdateCategoryController);
categoryRouter.delete('/:id', DeleteCategoryController);

export default categoryRouter;
