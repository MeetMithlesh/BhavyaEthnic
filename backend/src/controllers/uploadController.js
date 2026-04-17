import cloudinary from "../config/cloudinary.js";
import { AppError } from "../middleware/errorMiddleware.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const productUploadDir = path.resolve(__dirname, "..", "..", "uploads", "products");

const isCloudinaryConfigured = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );

const getPublicBaseUrl = (req) =>
  process.env.API_PUBLIC_URL || `${req.protocol}://${req.get("host")}`;

const uploadBufferToCloudinary = (file) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "bhavya-ethnic/products",
        resource_type: "image",
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      },
      (error, result) => {
        if (error) return reject(new AppError(`Cloudinary upload failed: ${error.message}`, 502));
        return resolve(result.secure_url);
      },
    );

    stream.end(file.buffer);
  });

const uploadBufferToLocalStatic = async (req, file) => {
  await fs.mkdir(productUploadDir, { recursive: true });

  const extension = path.extname(file.originalname).toLowerCase() || ".webp";
  const safeName = `${Date.now()}-${crypto.randomUUID()}${extension}`;
  const destination = path.join(productUploadDir, safeName);

  await fs.writeFile(destination, file.buffer);

  return `${getPublicBaseUrl(req)}/uploads/products/${safeName}`;
};

const uploadFile = async (req, file) => {
  if (!isCloudinaryConfigured()) {
    return {
      url: await uploadBufferToLocalStatic(req, file),
      provider: "local",
    };
  }

  try {
    return {
      url: await uploadBufferToCloudinary(file),
      provider: "cloudinary",
    };
  } catch (error) {
    console.warn(error.message);
    return {
      url: await uploadBufferToLocalStatic(req, file),
      provider: "local-fallback",
    };
  }
};

export const uploadImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new AppError("Please select at least one image to upload.", 400);
  }

  const uploads = await Promise.all(req.files.map((file) => uploadFile(req, file)));
  const images = uploads.map((upload) => upload.url);
  const providers = [...new Set(uploads.map((upload) => upload.provider))];

  return apiResponse(res, 201, "Images uploaded successfully.", {
    images,
    provider: providers.join(", "),
  });
});
