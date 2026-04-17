import multer from "multer";
import { AppError } from "./errorMiddleware.js";

const fileFilter = (_req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image uploads are allowed."), false);
  }

  return cb(null, true);
};

const uploadProductImages = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 8,
  },
}).array("images", 8);

export const handleProductImageUpload = (req, res, next) => {
  uploadProductImages(req, res, (error) => {
    if (!error) return next();

    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return next(new AppError("Each image must be 5MB or smaller.", 413));
      }

      if (error.code === "LIMIT_FILE_COUNT") {
        return next(new AppError("You can upload up to 8 images at once.", 413));
      }

      return next(new AppError(error.message, 400));
    }

    return next(new AppError(error.message || "Image upload failed.", 400));
  });
};
