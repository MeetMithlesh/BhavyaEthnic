import express from "express";
import { body } from "express-validator";
import {
  getWishlist,
  syncWishlist,
  toggleWishlistProduct,
} from "../controllers/wishlistController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/errorMiddleware.js";
import { isMongoId } from "../utils/validators.js";

const router = express.Router();

router.use(protect);

router.get("/", getWishlist);
router.put(
  "/sync",
  [
    body("products").isArray().withMessage("Products must be an array."),
    body("products.*").custom((value) => {
      if (!isMongoId(value)) throw new Error("Valid product id is required.");
      return true;
    }),
  ],
  validateRequest,
  syncWishlist,
);
router.post(
  "/toggle",
  [
    body("product").custom((value) => {
      if (!isMongoId(value)) throw new Error("Valid product id is required.");
      return true;
    }),
  ],
  validateRequest,
  toggleWishlistProduct,
);

export default router;
