import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";
import { AppError } from "../middleware/errorMiddleware.js";
import { sendEmail } from "../services/emailService.js";
import { orderPlacedEmail, orderStatusEmail } from "../services/orderEmailTemplates.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ORDER_STATUS, PAYMENT_STATUS, PRODUCT_STATUS } from "../utils/constants.js";

const updateProductStatusFromStock = async (product) => {
  const totalStock = product.sizes.reduce((sum, item) => sum + item.stock, 0);
  const nextStatus = totalStock > 0 ? PRODUCT_STATUS.IN_STOCK : PRODUCT_STATUS.OUT_OF_STOCK;

  if (product.status !== nextStatus) {
    await Product.findByIdAndUpdate(product._id, { status: nextStatus });
  }
};

const reserveOrderItem = async ({ product: productId, size, quantity }) => {
  const requestedSize = String(size).toUpperCase();
  const product = await Product.findOneAndUpdate(
    {
      _id: productId,
      sizes: {
        $elemMatch: {
          size: requestedSize,
          stock: { $gte: quantity },
        },
      },
    },
    { $inc: { "sizes.$.stock": -quantity } },
    { new: true },
  );

  if (!product) {
    throw new AppError(`Insufficient stock for size ${requestedSize}.`, 409);
  }

  await updateProductStatusFromStock(product);

  return {
    reserved: { productId: product._id, size: requestedSize, quantity },
    orderItem: {
      product: product._id,
      title: product.title,
      image: product.images[0],
      price: product.price,
      size: requestedSize,
      quantity,
    },
  };
};

const rollbackReservations = async (reservations) => {
  await Promise.all(
    reservations.map(async ({ productId, size, quantity }) => {
      const product = await Product.findOneAndUpdate(
        { _id: productId, "sizes.size": size },
        {
          $inc: { "sizes.$.stock": quantity },
          status: PRODUCT_STATUS.IN_STOCK,
        },
        { new: true },
      );

      if (product) await updateProductStatusFromStock(product);
    }),
  );
};

export const createOrder = asyncHandler(async (req, res) => {
  const items = [];
  const reservations = [];

  try {
    for (const item of req.body.items) {
      const { reserved, orderItem } = await reserveOrderItem(item);
      reservations.push(reserved);
      items.push(orderItem);
    }

    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = await Order.create({
      user: req.user._id,
      items,
      totalAmount,
      shippingAddress: req.body.shippingAddress,
      paymentStatus: req.body.paymentStatus || PAYMENT_STATUS.PENDING,
      orderStatus: ORDER_STATUS.LIVE,
    });

    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] }, { upsert: true });

    const email = orderPlacedEmail(order);
    await sendEmail({ to: req.user.email, ...email });

    return apiResponse(res, 201, "Order created successfully.", order);
  } catch (error) {
    await rollbackReservations(reservations);
    throw error;
  }
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  return apiResponse(res, 200, "Orders fetched successfully.", orders);
});

export const getAllOrders = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);
  const filters = {};

  if (req.query.status) filters.orderStatus = req.query.status;
  if (req.query.paymentStatus) filters.paymentStatus = req.query.paymentStatus;

  const [orders, total] = await Promise.all([
    Order.find(filters)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Order.countDocuments(filters),
  ]);

  return apiResponse(res, 200, "Admin orders fetched successfully.", orders, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");

  if (!order) {
    throw new AppError("Order not found.", 404);
  }

  const ownsOrder = order.user._id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "Admin";

  if (!ownsOrder && !isAdmin) {
    throw new AppError("You do not have permission to view this order.", 403);
  }

  return apiResponse(res, 200, "Order fetched successfully.", order);
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");

  if (!order) {
    throw new AppError("Order not found.", 404);
  }

  const { orderStatus, paymentStatus, trackingLink, trackingInfo, note } = req.body;

  if (orderStatus) {
    if (!Object.values(ORDER_STATUS).includes(orderStatus)) {
      throw new AppError("Invalid order status.", 422);
    }

    order.orderStatus = orderStatus;
    order.statusHistory.push({
      status: orderStatus,
      note: note || `Marked as ${orderStatus}.`,
    });
  }

  if (paymentStatus) {
    if (!Object.values(PAYMENT_STATUS).includes(paymentStatus)) {
      throw new AppError("Invalid payment status.", 422);
    }

    order.paymentStatus = paymentStatus;
  }

  if (trackingLink !== undefined) order.trackingLink = trackingLink;
  if (trackingInfo !== undefined) order.trackingInfo = trackingInfo;

  await order.save();

  if (orderStatus) {
    const email = orderStatusEmail(order);
    await sendEmail({ to: order.user.email, ...email });
  }

  return apiResponse(res, 200, "Order updated successfully.", order);
});
