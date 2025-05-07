//src/controllers/auth.controller.js-

import { catchAsync } from "../utils/catchAsync.js";
import { logger } from "../config/winston.js";
import prisma from "../lib/prismaClient.js";
const authLogger = logger.child({
  logIdentifier: "Auth Controller",
});

import jwt from "jsonwebtoken";
import {
  generateAccessToken,
  generateEmailToken,
  generateRefreshToken,
} from "../utils/jwt.js";
import { APIError } from "../utils/errorClass.js";
import {
  authUser_S,
  createUser_S,
  getJwtAudience,
  handleRefreshTokenService,
  sendVerificationCode,
} from "../services/auth.service.js";
import { REFRESH_PATH, setCookie } from "../utils/setCookie.js";
import { cookieExpires10days, thirtyDaysFromNow } from "../utils/date.js";
import { comparePassword, hashPassword } from "../utils/bcrypt.js";
import { sendEmail } from "../utils/sendEmail.js";
import { getPasswordResetTemplate } from "../utils/emailTemplates.js";

//Verify User Email
export const verificationCode = catchAsync(async (req, res) => {
  const userData = req.body;

  const token = await sendVerificationCode(userData);

  res.status(200).json({
    success: true,
    message: `Check your email: ${userData.email} for activation code to activate your account`,
    token,
  });
});

//Register User
const ACTIVATION_SECRET = process.env.ACTIVATION_SECRET;
export const register = catchAsync(async (req, res) => {
  const { activation_token, activation_code } = req.body;

  const newUser = jwt.verify(activation_token, ACTIVATION_SECRET);

  if (newUser.activationCode !== activation_code)
    throw new APIError("Invalid activation code", 400);

  const userData = newUser.user;

  const userAgent = req.headers["user-agent"];
  const user = await createUser_S(userData);

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      userAgent,
      expiresAt: thirtyDaysFromNow(),
    },
  });

  if (!user) {
    authLogger.warn("User registration failed");
    throw new APIError("User registration failed", 400);
  }

  const audience = getJwtAudience(user.role);

  const accessToken = generateAccessToken(user, session.id, audience);
  const refreshToken = generateRefreshToken(session.id, audience);
  // setCookie(res, "accessToken", accessToken, {
  //   maxAge: cookieExpires15m,
  // });
  setCookie(res, "refreshToken", refreshToken, {
    maxAge: cookieExpires10days,
    path: REFRESH_PATH,
  });

  res.status(201).json({
    message: "User registered successfully",
    data: { user, accessToken },
  });
});

export const loginUser = catchAsync(async (req, res) => {
  const userData = req.body;
  const user = await authUser_S(userData);

  const audience = getJwtAudience(user.role);

  const userAgent = req.headers["user-agent"];
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      userAgent,
      expiresAt: thirtyDaysFromNow(),
    },
  });

  if (!session) {
    authLogger.warn("User session creation failed");
    throw new APIError("User session creation failed", 400);
  }

  const accessToken = generateAccessToken(user, session.id, audience);
  const refreshToken = generateRefreshToken(session.id, audience);
  // setCookie(res, "accessToken", accessToken, {
  //   maxAge: cookieExpires15m,
  // });
  setCookie(res, "refreshToken", refreshToken, {
    maxAge: cookieExpires10days,
    path: REFRESH_PATH,
  });

  res.status(200).json({
    success: true,
    message: "User login successful",
    data: { user, accessToken },
  });
});

export const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    authLogger.warn("Email is required for password reset");
    throw new APIError("Email is required for password reset", 400);
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    authLogger.warn("User not found with this email");
    throw new APIError("User not found with this email", 404);
  }

  // TODO: check email rate limit
  // const fiveMinutesAgo = fiveMinutesAgo();

  const APP_ORIGIN_PROD = process.env.APP_ORIGIN_PROD;
  const APP_ORIGIN_DEV = process.env.APP_ORIGIN_DEV;

  const token = generateEmailToken(user);

  const resetUrl =
    process.env.NODE_ENV === "production"
      ? `${APP_ORIGIN_PROD}/api/auth/reset-password?token=${token}`
      : `${APP_ORIGIN_DEV}/api/auth/reset-password?token=${token}`;

  const { error } = await sendEmail({
    to: user.email,
    ...getPasswordResetTemplate(resetUrl),
  });

  if (error) {
    authLogger.error("Error sending password reset email", error);
    throw new APIError("Error sending password reset email", 500);
  }

  res.status(200).json({
    success: true,
    message: `Password reset link sent to ${user.email}`,
    data: {
      email: user.email,
      resetUrl,
    },
  });
});

export const resetPassword = catchAsync(async (req, res) => {
  const { newPassword, token } = req.body;
  // const token = req.query.token;

  const decoded = jwt.verify(token, process.env.EMAIL_JWT_SECRET);
  const user = await prisma.user.findUnique({
    where: {
      id: decoded.userId,
    },
  });

  if (!user) throw new APIError("User not found", 404);

  const isMatch = await comparePassword(newPassword, user.password);
  if (isMatch)
    throw new APIError("New password cannot be the same as old password", 400);

  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      newPassword: hashedPassword,
    },
  });

  res.json({ success: true, message: "Password has been reset successfully" });
});

export const refreshTokenController = catchAsync(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  const { accessToken, newRefreshToken } =
    await handleRefreshTokenService(refreshToken);

  if (newRefreshToken) {
    setCookie(res, "refreshToken", newRefreshToken, {
      maxAge: cookieExpires10days,
      path: REFRESH_PATH,
    });
  }

  res.status(200).json({
    status: true,
    accessToken,
    refreshToken: newRefreshToken || null,
    message: "Access token refreshed successfully",
  });
});

export const logout = catchAsync(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "User logged out successfully",
  });
});
