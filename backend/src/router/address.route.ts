import { Router } from "express";
import { AuthMiddleware } from "../middleware/auth.middlewate";
import {
  CreateAddressController,
  GetAddressesController,
  GetAddressDetailsController,
  UpdateAddressController,
  SetDefaultAddressController,
  DeleteAddressController,
  GetAddressStatsController,
  GetDefaultAddressController,
} from "../controllers/address.controller";

const router = Router();

// All address routes require authentication
router.use(AuthMiddleware);

// Create new address
router.post("/", CreateAddressController);

// Get all addresses with pagination and filters
router.get("/", GetAddressesController);

// Get default address
router.get("/default", GetDefaultAddressController);

// Get address statistics
router.get("/stats", GetAddressStatsController);

// Get specific address details
router.get("/:id", GetAddressDetailsController);

// Update address
router.patch("/:id", UpdateAddressController);

// Set address as default
router.patch("/:id/set-default", SetDefaultAddressController);

// Delete address
router.delete("/:id", DeleteAddressController);

export default router;
