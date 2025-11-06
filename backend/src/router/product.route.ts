import { Router } from "express";
import { 
    CreateProductController,
    GetAllProductsController,
    GetProductController,
    UpdateProductController,
    DeleteProductController,
    GetProductsByCategoryController
} from "../controllers/product.controller";
import { AuthMiddleware } from "../middleware/auth.middlewate";
import { requireRole } from "../middleware/role.middleware";
import { uploadMultiple } from "../middleware/multer.middleware";

const router = Router();

// Public routes
router.get("/", GetAllProductsController);
router.get("/:id", GetProductController);
router.get("/category/:categoryId", GetProductsByCategoryController);

// Protected routes (require authentication and vendor role)
router.use(AuthMiddleware);
router.use(requireRole(['VENDOR']));

router.post("/", uploadMultiple, CreateProductController);
router.put("/:id", uploadMultiple, UpdateProductController);
router.delete("/:id", DeleteProductController);

export default router;
