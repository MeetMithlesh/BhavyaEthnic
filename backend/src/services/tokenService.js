import jwt from "jsonwebtoken";

export const signToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing from the environment.");
  }

  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

export const sendTokenCookie = (res, token) => {
  const days = Number(process.env.JWT_COOKIE_EXPIRES_DAYS || 7);

  res.cookie("bhavya_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    expires: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
  });
};

export const clearTokenCookie = (res) => {
  res.clearCookie("bhavya_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
};

export const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);
