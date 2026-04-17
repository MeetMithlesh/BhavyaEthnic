import User from "../models/User.js";
import { verifyGoogleToken } from "../config/googleOAuth.js";
import { clearTokenCookie, sendTokenCookie, signToken } from "../services/tokenService.js";
import { sendEmail } from "../services/emailService.js";
import { registrationEmail } from "../services/orderEmailTemplates.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { USER_ROLES } from "../utils/constants.js";
import { AppError } from "../middleware/errorMiddleware.js";

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  addresses: user.addresses,
});

const issueAuthResponse = (res, user, statusCode, message) => {
  const token = signToken(user._id);
  sendTokenCookie(res, token);

  return apiResponse(res, statusCode, message, {
    token,
    user: publicUser(user),
  });
};

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    role: USER_ROLES.CUSTOMER,
  });

  const welcome = registrationEmail(user.name);
  await sendEmail({ to: user.email, ...welcome });

  return issueAuthResponse(res, user, 201, "Registration successful.");
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid email or password.", 401);
  }

  return issueAuthResponse(res, user, 200, "Login successful.");
});

export const googleAuth = asyncHandler(async (req, res) => {
  const payload = await verifyGoogleToken(req.body.credential);

  if (!payload?.email_verified) {
    throw new AppError("Google email is not verified.", 401);
  }

  const user = await User.findOneAndUpdate(
    { email: payload.email },
    {
      $set: {
        name: payload.name,
        googleId: payload.sub,
      },
      $setOnInsert: {
        role: USER_ROLES.CUSTOMER,
      },
    },
    { new: true, upsert: true, runValidators: true },
  );

  return issueAuthResponse(res, user, 200, "Google login successful.");
});

export const logout = asyncHandler(async (_req, res) => {
  clearTokenCookie(res);
  return apiResponse(res, 200, "Logged out successfully.");
});

export const getMe = asyncHandler(async (req, res) => {
  return apiResponse(res, 200, "Profile fetched successfully.", {
    user: publicUser(req.user),
  });
});

export const updateAddresses = asyncHandler(async (req, res) => {
  req.user.addresses = req.body.addresses || [];
  await req.user.save();

  return apiResponse(res, 200, "Addresses updated successfully.", {
    user: publicUser(req.user),
  });
});
