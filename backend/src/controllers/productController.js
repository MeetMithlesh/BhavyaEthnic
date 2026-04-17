import Product from "../models/Product.js";
import { AppError } from "../middleware/errorMiddleware.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { PRODUCT_STATUS } from "../utils/constants.js";

const buildProductFilters = (query) => {
  const filters = {};

  if (query.search) {
    filters.$text = { $search: query.search };
  }

  if (query.category) {
    filters.category = { $in: String(query.category).split(",") };
  }

  if (query.size) {
    filters.sizes = {
      $elemMatch: {
        size: { $in: String(query.size).split(",").map((item) => item.toUpperCase()) },
        stock: { $gt: 0 },
      },
    };
  }

  if (query.minPrice || query.maxPrice) {
    filters.price = {};
    if (query.minPrice) filters.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filters.price.$lte = Number(query.maxPrice);
  }

  if (query.status) {
    filters.status = query.status;
  }

  return filters;
};

const buildSort = (sort) => {
  const sortMap = {
    newest: { createdAt: -1 },
    "price-low": { price: 1 },
    "price-high": { price: -1 },
    rating: { ratingsAverage: -1 },
  };

  return sortMap[sort] || sortMap.newest;
};

export const getProducts = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 12);
  const skip = (page - 1) * limit;
  const filters = buildProductFilters(req.query);

  const [products, total] = await Promise.all([
    Product.find(filters).sort(buildSort(req.query.sort)).skip(skip).limit(limit),
    Product.countDocuments(filters),
  ]);

  return apiResponse(res, 200, "Products fetched successfully.", products, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});

export const getProductByIdOrSlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    $or: [{ _id: req.params.idOrSlug.match(/^[0-9a-fA-F]{24}$/) ? req.params.idOrSlug : null }, { slug: req.params.idOrSlug }],
  });

  if (!product) {
    throw new AppError("Product not found.", 404);
  }

  return apiResponse(res, 200, "Product fetched successfully.", product);
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  return apiResponse(res, 201, "Product created successfully.", product);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new AppError("Product not found.", 404);
  }

  Object.assign(product, req.body);
  await product.save();

  return apiResponse(res, 200, "Product updated successfully.", product);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    throw new AppError("Product not found.", 404);
  }

  return apiResponse(res, 200, "Product deleted successfully.");
});

export const addReview = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new AppError("Product not found.", 404);
  }

  const alreadyReviewed = product.reviews.some(
    (review) => review.user.toString() === req.user._id.toString(),
  );

  if (alreadyReviewed) {
    throw new AppError("You have already reviewed this product.", 409);
  }

  product.reviews.push({
    user: req.user._id,
    name: req.user.name,
    rating: req.body.rating,
    comment: req.body.comment,
  });
  product.recalculateRatings();
  await product.save();

  return apiResponse(res, 201, "Review added successfully.", product);
});

export const getProductFacets = asyncHandler(async (_req, res) => {
  const [categories, sizeDocs, priceDoc] = await Promise.all([
    Product.distinct("category"),
    Product.aggregate([
      { $unwind: "$sizes" },
      { $match: { "sizes.stock": { $gt: 0 } } },
      { $group: { _id: "$sizes.size" } },
      { $sort: { _id: 1 } },
    ]),
    Product.aggregate([
      {
        $group: {
          _id: null,
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        },
      },
    ]),
  ]);

  return apiResponse(res, 200, "Product filters fetched successfully.", {
    categories,
    sizes: sizeDocs.map((item) => item._id),
    price: priceDoc[0] || { minPrice: 0, maxPrice: 0 },
    statuses: Object.values(PRODUCT_STATUS),
  });
});
