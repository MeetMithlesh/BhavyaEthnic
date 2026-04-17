export const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

export const orderSteps = ["Live", "Confirmed", "Shipped", "Delivered"];

export const getOrderStepIndex = (status) => Math.max(0, orderSteps.indexOf(status));
