import express from "express";
import { body, param } from "express-validator";
import {
  addToCart,
  clearCart,
  getCart,
  removeFromCart,
  syncCart,
} from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/errorMiddleware.js";
import { isMongoId } from "../utils/validators.js";

const router = express.Router();

router.use(protect);

const cartItemValidator = [
  body("product").custom((value) => {
    if (!isMongoId(value)) throw new Error("Valid product id is required.");
    return true;
  }),
  body("size").trim().notEmpty().withMessage("Size is required."),
  body("quantity").optional().isInt({ min: 1 }).withMessage("Quantity must be at least 1."),
];

const syncCartValidator = [
  body("items").isArray().withMessage("Items must be an array."),
  body("items.*.product").custom((value) => {
    if (!isMongoId(value)) throw new Error("Valid product id is required.");
    return true;
  }),
  body("items.*.size").trim().notEmpty().withMessage("Size is required."),
  body("items.*.quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1."),
];

router.get("/", getCart);
router.put("/sync", syncCartValidator, validateRequest, syncCart);
router.post("/items", cartItemValidator, validateRequest, addToCart);
router.delete(
  "/items/:productId/:size",
  [
    param("productId").custom((value) => {
      if (!isMongoId(value)) throw new Error("Valid product id is required.");
      return true;
    }),
    param("size").trim().notEmpty().withMessage("Size is required."),
  ],
  validateRequest,
  removeFromCart,
);
router.delete("/", clearCart);

export default router;
