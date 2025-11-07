import { Router } from "express";
import { AuthMiddleware } from "../middleware/auth.middlewate";
import { requireRole } from "../middleware/role.middleware";
import {
  CreateOrderController,
  GetOrdersController,
  GetOrderDetailsController,
  UpdateOrderStatusController,
  CancelOrderController,
  GetOrderSummaryController,
} from "../controllers/order.controller";

const orderRouter = Router();

// User routes (requires authentication)
orderRouter.get("/", AuthMiddleware, GetOrdersController);
orderRouter.get("/summary", AuthMiddleware, GetOrderSummaryController);
orderRouter.get("/:id", AuthMiddleware, GetOrderDetailsController);
orderRouter.post("/", AuthMiddleware, CreateOrderController);
orderRouter.post("/:id/cancel", AuthMiddleware, CancelOrderController);

// Vendor routes (requires authentication and vendor role)
orderRouter.patch("/:id/status", AuthMiddleware, requireRole(["VENDOR"]), UpdateOrderStatusController);

export default orderRouter;
