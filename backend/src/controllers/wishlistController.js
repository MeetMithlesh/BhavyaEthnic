import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";
import { AppError } from "../middleware/errorMiddleware.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const populateWishlist = (query) =>
  query.populate("products", "title slug price mrp images category sizes status ratingsAverage");

export const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await populateWishlist(
    Wishlist.findOneAndUpdate(
      { user: req.user._id },
      { $setOnInsert: { products: [] } },
      { new: true, upsert: true },
    ),
  );

  return apiResponse(res, 200, "Wishlist fetched successfully.", wishlist);
});

export const syncWishlist = asyncHandler(async (req, res) => {
  const productIds = req.body.products || [];
  const count = await Product.countDocuments({ _id: { $in: productIds } });

  if (count !== productIds.length) {
    throw new AppError("One or more wishlist products do not exist.", 404);
  }

  const wishlist = await populateWishlist(
    Wishlist.findOneAndUpdate(
      { user: req.user._id },
      { products: productIds },
      { new: true, upsert: true, runValidators: true },
    ),
  );

  return apiResponse(res, 200, "Wishlist synced successfully.", wishlist);
});

export const toggleWishlistProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.body.product);

  if (!product) {
    throw new AppError("Product not found.", 404);
  }

  let wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, products: [] });
  }

  const exists = wishlist.products.some((item) => item.toString() === product._id.toString());

  if (exists) {
    wishlist.products = wishlist.products.filter(
      (item) => item.toString() !== product._id.toString(),
    );
  } else {
    wishlist.products.push(product._id);
  }

  await wishlist.save();
  await wishlist.populate("products", "title slug price mrp images category sizes status ratingsAverage");

  return apiResponse(res, 200, exists ? "Removed from wishlist." : "Added to wishlist.", wishlist);
});
