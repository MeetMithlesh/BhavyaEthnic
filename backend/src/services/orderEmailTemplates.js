export const registrationEmail = (name) => ({
  subject: "Welcome to Bhavya Ethnic",
  html: `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#2f2926">
      <h2>Namaste ${name},</h2>
      <p>Welcome to Bhavya Ethnic. We are delighted to have you with us.</p>
      <p>Discover premium Jaipur-inspired ethnic wear crafted for celebrations, comfort, and everyday elegance.</p>
    </div>
  `,
});

export const orderPlacedEmail = (order) => ({
  subject: `Bhavya Ethnic order received - ${order._id}`,
  html: `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#2f2926">
      <h2>Your order is live</h2>
      <p>We have received your order worth <strong>₹${order.totalAmount}</strong>.</p>
      <p>You will receive another update when the order is confirmed or shipped.</p>
    </div>
  `,
});

export const orderStatusEmail = (order) => ({
  subject: `Your Bhavya Ethnic order is ${order.orderStatus}`,
  html: `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#2f2926">
      <h2>Order update: ${order.orderStatus}</h2>
      <p>Your order <strong>${order._id}</strong> is now <strong>${order.orderStatus}</strong>.</p>
      ${
        order.trackingLink
          ? `<p>Track it here: <a href="${order.trackingLink}">${order.trackingLink}</a></p>`
          : ""
      }
      ${order.trackingInfo ? `<p>${order.trackingInfo}</p>` : ""}
    </div>
  `,
});
