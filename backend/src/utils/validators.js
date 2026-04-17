import { body, param, query } from "express-validator";
import mongoose from "mongoose";

export const isMongoId = (value) => mongoose.Types.ObjectId.isValid(value);

export const idParamValidator = [
  param("id").custom((value) => {
    if (!isMongoId(value)) {
      throw new Error("Invalid resource id.");
    }

    return true;
  }),
];

export const registerValidator = [
  body("name").trim().isLength({ min: 2 }).withMessage("Name is required."),
  body("email").trim().isEmail().normalizeEmail().withMessage("Valid email is required."),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long."),
];

export const loginValidator = [
  body("email").trim().isEmail().normalizeEmail().withMessage("Valid email is required."),
  body("password").notEmpty().withMessage("Password is required."),
];

export const googleAuthValidator = [
  body("credential").notEmpty().withMessage("Google credential token is required."),
];

export const productValidator = [
  body("title").trim().isLength({ min: 2 }).withMessage("Product title is required."),
  body("description").trim().isLength({ min: 10 }).withMessage("Description is required."),
  body("price").isFloat({ min: 0 }).withMessage("Price must be a valid number."),
  body("mrp").optional().isFloat({ min: 0 }).withMessage("MRP must be a valid number."),
  body("images").isArray({ min: 1 }).withMessage("At least one product image is required."),
  body("images.*").isURL().withMessage("Each product image must be a valid URL."),
  body("category").trim().notEmpty().withMessage("Category is required."),
  body("sizes").isArray({ min: 1 }).withMessage("At least one size is required."),
  body("sizes.*.size").trim().notEmpty().withMessage("Each size needs a label."),
  body("sizes.*.stock").isInt({ min: 0 }).withMessage("Stock must be zero or greater."),
];

export const reviewValidator = [
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5."),
  body("comment").trim().isLength({ min: 3 }).withMessage("Comment is required."),
];

export const orderValidator = [
  body("items").isArray({ min: 1 }).withMessage("Order must include at least one item."),
  body("items.*.product").custom((value) => {
    if (!isMongoId(value)) throw new Error("Invalid product id in order item.");
    return true;
  }),
  body("items.*.size").trim().notEmpty().withMessage("Size is required for each item."),
  body("items.*.quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1."),
  body("shippingAddress.fullName").trim().notEmpty().withMessage("Full name is required."),
  body("shippingAddress.phone").trim().notEmpty().withMessage("Phone is required."),
  body("shippingAddress.addressLine1").trim().notEmpty().withMessage("Address line 1 is required."),
  body("shippingAddress.city").trim().notEmpty().withMessage("City is required."),
  body("shippingAddress.state").trim().notEmpty().withMessage("State is required."),
  body("shippingAddress.postalCode").trim().notEmpty().withMessage("Postal code is required."),
];

export const productQueryValidator = [
  query("minPrice").optional().isFloat({ min: 0 }),
  query("maxPrice").optional().isFloat({ min: 0 }),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
];
