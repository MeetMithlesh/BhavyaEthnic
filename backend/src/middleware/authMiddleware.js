import User from "../models/User.js";
import { verifyToken } from "../services/tokenService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "./errorMiddleware.js";

export const protect = asyncHandler(async (req, _res, next) => {
  let token = req.cookies?.bhavya_token;

  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new AppError("Please login to continue.", 401);
  }

  const decoded = verifyToken(token);
  const user = await User.findById(decoded.id);

  if (!user) {
    throw new AppError("The user belonging to this token no longer exists.", 401);
  }

  req.user = user;
  next();
});
