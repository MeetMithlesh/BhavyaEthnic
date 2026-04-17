import { validationResult } from "express-validator";
import { apiResponse } from "../utils/apiResponse.js";

export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

export const validateRequest = (req, _res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) return next();

  const message = errors.array().map((error) => error.msg).join(" ");
  return next(new AppError(message, 422));
};

export const notFound = (req, _res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};

export const errorHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;

  if (error.name === "CastError") {
    return apiResponse(res, 400, "Invalid id format.");
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0] || "field";
    return apiResponse(res, 409, `A record with this ${field} already exists.`);
  }

  if (error.name === "ValidationError") {
    const message = Object.values(error.errors).map((item) => item.message).join(" ");
    return apiResponse(res, 422, message);
  }

  const message =
    process.env.NODE_ENV === "production" && !error.isOperational
      ? "Something went wrong."
      : error.message;

  return apiResponse(res, statusCode, message);
};
