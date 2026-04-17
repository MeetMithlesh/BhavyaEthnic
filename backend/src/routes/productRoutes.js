import express from "express";
import {
  addReview,
  createProduct,
  deleteProduct,
  getProductByIdOrSlug,
  getProductFacets,
  getProducts,
  updateProduct,
} from "../controllers/productController.js";
import { adminOnly } from "../middleware/adminMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/errorMiddleware.js";
import {
  idParamValidator,
  productQueryValidator,
  productValidator,
  reviewValidator,
} from "../utils/validators.js";

const router = express.Router();

router.get("/", productQueryValidator, validateRequest, getProducts);
router.get("/facets", getProductFacets);
router.get("/:idOrSlug", getProductByIdOrSlug);
router.post("/", protect, adminOnly, productValidator, validateRequest, createProduct);
router.put("/:id", protect, adminOnly, idParamValidator, productValidator, validateRequest, updateProduct);
router.delete("/:id", protect, adminOnly, idParamValidator, validateRequest, deleteProduct);
router.post("/:id/reviews", protect, idParamValidator, reviewValidator, validateRequest, addReview);

export default router;
