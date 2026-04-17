import express from "express";
import {
  getMe,
  googleAuth,
  login,
  logout,
  register,
  updateAddresses,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/errorMiddleware.js";
import {
  googleAuthValidator,
  loginValidator,
  registerValidator,
} from "../utils/validators.js";

const router = express.Router();

router.post("/register", registerValidator, validateRequest, register);
router.post("/login", loginValidator, validateRequest, login);
router.post("/google", googleAuthValidator, validateRequest, googleAuth);
router.post("/logout", logout);
router.get("/me", protect, getMe);
router.put("/addresses", protect, updateAddresses);

export default router;
