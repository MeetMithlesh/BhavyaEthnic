import dotenv from "dotenv";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import { USER_ROLES } from "../utils/constants.js";

dotenv.config();

const seedAdmin = async () => {
  await connectDB();

  const name = process.env.ADMIN_NAME || "Bhavya Admin";
  const email = process.env.ADMIN_EMAIL || "mithlesh0714.s@gmail.com";
  const password = process.env.ADMIN_PASSWORD || "Meet@123";

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required to seed an admin.");
  }

  const admin = await User.findOneAndUpdate(
    { email },
    {
      name,
      email,
      password,
      role: USER_ROLES.ADMIN,
    },
    { new: true, upsert: true, runValidators: true },
  );

  // Password hashing only runs on save middleware, so save after upsert assignment.
  admin.password = password;
  await admin.save();

  console.log(`Admin ready: ${admin.email}`);
  process.exit(0);
};

seedAdmin().catch((error) => {
  console.error(error);
  process.exit(1);
});
