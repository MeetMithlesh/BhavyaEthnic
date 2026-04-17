import express from "express";
import { uploadImages } from "../controllers/uploadController.js";
import { adminOnly } from "../middleware/adminMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import { handleProductImageUpload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/products", protect, adminOnly, handleProductImageUpload, uploadImages);

export default router;
