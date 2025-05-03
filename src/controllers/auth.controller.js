//src/controllers/auth.controller.js

import { catchAsync } from "../utils/catchAsync.js";
import { logger } from "../config/winston.js";
const authLogger = logger.child({
  logIdentifier: "Auth Controller",
});

import jwt from "jsonwebtoken";
import { generateEmailToken, generateToken } from "../utils/jwt.js";
import { APIError } from "../utils/errorClass.js";
import { createUser } from "../services/auth.service.js";
import { setCookie } from "../utils/setCookie.js";
import { cookieExpiresInOneDay } from "../utils/expires.js";
import { comparePassword, hashPassword } from "../utils/bcrypt.js";
import { sendMail, sendOTP } from "../utils/sendMail.js";

export const register = catchAsync(async (req, res) => {
  const { username, email, role, password } = req.body;
  const userData = {
    username,
    email,
    role,
    password,
  };
  const user = await createUser(userData);

  if (!user) {
    authLogger.warn("User registration failed");
    return res.status(400).json({
      success: false,
      message: "User registration failed",
    });
  }

  const token = generateToken(user);
  setCookie(res, "accessToken", token.accessToken, {
    maxAge: cookieExpiresInOneDay,
  });

  const { password: _, ...newUser } = userData;

  res.status(201).json({
    message: "User registered successfully",
    data: { user: newUser, token },
  });
});

export const loginUser = catchAsync(async (req, res) => {
  const { email, username, password } = req.body;
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
  });

  if (!user) throw new APIError("User not found", 404);

  const isMatch = await comparePassword(password, user.password);

  if (!isMatch) throw new APIError("Incorrect Password", 400);

  const token = generateToken(user);
  setCookie(res, "token", token, {
    maxAge: cookieExpiresInOneDay,
  });

  const { password: _, ...userWithoutPassword } = user;
  res.status(200).json({
    success: true,
    message: "User login successful",
    data: { user: userWithoutPassword, token },
  });
});

export const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    authLogger.warn("Email is required for password reset");
    throw new APIError("Email is required for password reset", 400);
  }

  const user = await prisma.user.findFirst({
    where: {
      email,
    },
  });

  if (!user) {
    authLogger.warn("User not found with this email");
    throw new APIError("User not found with this email", 404);
  }

  const token = generateEmailToken(user);
  const resetUrl =
    process.env.NODE_ENV === "production"
      ? `https://dive-africa-lms-backend.onrender.com/api/auth/reset-password?token=${token}`
      : `http://localhost:3000/api/auth/reset-password?token=${token}`;
  const sentEmail = await sendMail(
    user.email,
    "Password Reset",
    `Click to reset: ${resetUrl}`
  );

  res.status(200).json({
    success: true,
    message: `Password reset link sent to ${sentEmail}`,
  });
});

export const resetPassword = catchAsync(async (req, res) => {
  // const { token, newPassword } = req.body;
  const { newPassword } = req.body;
  const token = req.query.token; // Token comes from the URL query string

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await prisma.user.findUnique({
    where: {
      id: decoded.userId,
    },
  });

  if (!user) throw new APIError("User not found", 404);

  const isMatch = await comparePassword(newPassword, user.password);
  if (isMatch)
    throw new APIError("New password cannot be the same as old password", 400);

  const hashPassword = hashPassword(newPassword);

  await prisma.user.update({
    where: { id },
    data: {
      newPassword: hashPassword,
    },
  });

  res.json({ success: true, message: "Password has been reset successfully" });
});
