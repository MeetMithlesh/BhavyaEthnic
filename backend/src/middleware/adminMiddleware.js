import { USER_ROLES } from "../utils/constants.js";
import { AppError } from "./errorMiddleware.js";

export const adminOnly = (req, _res, next) => {
  if (req.user?.role !== USER_ROLES.ADMIN) {
    return next(new AppError("Admin access required.", 403));
  }

  return next();
};
