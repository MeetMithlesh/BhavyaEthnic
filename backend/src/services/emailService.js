import nodemailer from "nodemailer";

const createTransporter = () => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
};

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();

  // Email is optional in local development; skipping avoids blocking order flows.
  if (!transporter) {
    console.warn("Email service not configured. Skipping email:", subject);
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.GMAIL_USER,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.warn(`Email failed but request will continue: ${error.message}`);
  }
};
