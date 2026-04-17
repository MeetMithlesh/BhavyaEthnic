export const USER_ROLES = {
  ADMIN: "Admin",
  CUSTOMER: "Customer",
};

export const PRODUCT_STATUS = {
  IN_STOCK: "In Stock",
  OUT_OF_STOCK: "Out of Stock",
};

export const PAYMENT_STATUS = {
  PENDING: "Pending",
  PAID: "Paid",
  FAILED: "Failed",
  REFUNDED: "Refunded",
};

export const ORDER_STATUS = {
  LIVE: "Live",
  CONFIRMED: "Confirmed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const ORDER_STATUS_FLOW = [
  ORDER_STATUS.LIVE,
  ORDER_STATUS.CONFIRMED,
  ORDER_STATUS.SHIPPED,
  ORDER_STATUS.DELIVERED,
];
