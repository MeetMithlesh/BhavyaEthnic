import mongoose from "mongoose";
import slugify from "slugify";
import { PRODUCT_STATUS } from "../utils/constants.js";

const sizeStockSchema = new mongoose.Schema(
  {
    size: { type: String, required: true, trim: true, uppercase: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
  },
  { _id: false },
);

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 800 },
  },
  { timestamps: true },
);

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Product title is required."],
      trim: true,
      maxlength: 140,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required."],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required."],
      min: 0,
    },
    mrp: {
      type: Number,
      min: 0,
    },
    images: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      required: [true, "Category is required."],
      trim: true,
      index: true,
    },
    sizes: {
      type: [sizeStockSchema],
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: "At least one size with stock is required.",
      },
    },
    status: {
      type: String,
      enum: Object.values(PRODUCT_STATUS),
      default: PRODUCT_STATUS.IN_STOCK,
    },
    ratingsAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      set: (value) => Math.round(value * 10) / 10,
    },
    ratingsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    reviews: [reviewSchema],
    replacementPolicy: {
      type: String,
      trim: true,
      default:
        "Eligible for replacement within 7 days for manufacturing defects. Items must be unused with original tags.",
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

productSchema.index({ title: "text", description: "text", category: "text" });

productSchema.pre("validate", function prepareProduct(next) {
  if (this.isModified("title")) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }

  const totalStock = this.sizes?.reduce((sum, item) => sum + item.stock, 0) || 0;
  this.status = totalStock > 0 ? PRODUCT_STATUS.IN_STOCK : PRODUCT_STATUS.OUT_OF_STOCK;

  next();
});

productSchema.methods.recalculateRatings = function recalculateRatings() {
  this.ratingsCount = this.reviews.length;

  if (this.reviews.length === 0) {
    this.ratingsAverage = 0;
    return;
  }

  const total = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.ratingsAverage = total / this.reviews.length;
};

const Product = mongoose.model("Product", productSchema);

export default Product;
