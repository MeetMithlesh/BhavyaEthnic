import express from "express";
import {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { adminOnly } from "../middleware/adminMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/errorMiddleware.js";
import { idParamValidator, orderValidator } from "../utils/validators.js";

const router = express.Router();

router.use(protect);

router.post("/", orderValidator, validateRequest, createOrder);
router.get("/mine", getMyOrders);
router.get("/admin", adminOnly, getAllOrders);
router.get("/:id", idParamValidator, validateRequest, getOrderById);
router.put("/:id/status", adminOnly, idParamValidator, validateRequest, updateOrderStatus);

export default router;
