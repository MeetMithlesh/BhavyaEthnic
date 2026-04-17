import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { AppError } from "../middleware/errorMiddleware.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const populateCart = (query) =>
  query.populate("items.product", "title slug price mrp images category sizes status");

const assertProductStock = async (productId, size, quantity) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw new AppError("Product not found.", 404);
  }

  const requestedSize = String(size).toUpperCase();
  const sizeStock = product.sizes.find((item) => item.size === requestedSize);

  if (!sizeStock || sizeStock.stock < quantity) {
    throw new AppError(`Only ${sizeStock?.stock || 0} left in size ${requestedSize}.`, 409);
  }
};

export const getCart = asyncHandler(async (req, res) => {
  const cart = await populateCart(
    Cart.findOneAndUpdate(
      { user: req.user._id },
      { $setOnInsert: { items: [] } },
      { new: true, upsert: true },
    ),
  );

  return apiResponse(res, 200, "Cart fetched successfully.", cart);
});

export const syncCart = asyncHandler(async (req, res) => {
  const items = req.body.items || [];

  for (const item of items) {
    await assertProductStock(item.product, item.size, item.quantity);
  }

  const cart = await populateCart(
    Cart.findOneAndUpdate(
      { user: req.user._id },
      {
        items: items.map((item) => ({
          product: item.product,
          size: String(item.size).toUpperCase(),
          quantity: item.quantity,
        })),
      },
      { new: true, upsert: true, runValidators: true },
    ),
  );

  return apiResponse(res, 200, "Cart synced successfully.", cart);
});

export const addToCart = asyncHandler(async (req, res) => {
  const { product, size, quantity = 1 } = req.body;
  const requestedSize = String(size).toUpperCase();

  await assertProductStock(product, requestedSize, quantity);

  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    { $setOnInsert: { items: [] } },
    { new: true, upsert: true },
  );

  const existingItem = cart.items.find(
    (item) => item.product.toString() === product && item.size === requestedSize,
  );

  if (existingItem) {
    const nextQuantity = existingItem.quantity + Number(quantity);
    await assertProductStock(product, requestedSize, nextQuantity);
    existingItem.quantity = nextQuantity;
  } else {
    cart.items.push({ product, size: requestedSize, quantity });
  }

  await cart.save();
  await cart.populate("items.product", "title slug price mrp images category sizes status");

  return apiResponse(res, 200, "Added to cart.", cart);
});

export const removeFromCart = asyncHandler(async (req, res) => {
  const { productId, size } = req.params;
  const requestedSize = String(size).toUpperCase();

  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    {
      $pull: {
        items: {
          product: productId,
          size: requestedSize,
        },
      },
    },
    { new: true, upsert: true },
  ).populate("items.product", "title slug price mrp images category sizes status");

  return apiResponse(res, 200, "Removed from cart.", cart);
});

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    { items: [] },
    { new: true, upsert: true },
  );

  return apiResponse(res, 200, "Cart cleared successfully.", cart);
});
