import { catchAsync } from "../../utils/catchAsync.js";
import { logger } from "../../utils/logger.js";
const authLogger = logger.child({
  logIdentifier: "Auth Controller",
});

import jwt from "jsonwebtoken";
import User from "../users/user.model.js";
import { APIError } from "../../utils/errorClass.js";

const JWT_SECRET = process.env.JWT_SECRET;

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      username: user.username,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "1d" }
  );
};

export const registerUser = catchAsync(async (req, res) => {
  const { username, email, role, password } = req.body;

  if (!username || !email || !password) {
    authLogger.warn("All fields are required");
    return res.status(400).json({
      status: false,
      message: "All fields are required",
    });
  }

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existingUser?.username === username) {
    authLogger.warn("User already exists with this username");
    throw new APIError(
      `User already exists with this username ${username}`,
      409
    );
  }

  if (existingUser?.email === email) {
    authLogger.warn("User already exists with this email");
    return res.status(409).json({
      status: false,
      message: `User already exists with this email ${email} `,
    });
  }

  const user = await User.create({ username, email, role, password });

  const token = generateToken(user);

  const { password: _, ...userWithoutPassword } = user.toObject();

  res.status(201).json({
    message: "User registered successfully",
    data: { user: userWithoutPassword, token },
  });
});

export const loginUser = catchAsync(async (req, res) => {
  const { email, username, password } = req.body;
  const user = await User.login(email || username, password);

  const token = generateToken(user);

  const { password: _, ...userWithoutPassword } = user.toObject();
  res.status(200).json({
    status: true,
    message: "User login successful",
    data: { user: userWithoutPassword, token },
  });
});

export const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    authLogger.warn("Email is required for password reset");
    return res.status(400).json({
      status: false,
      message: "Email is required for password reset",
    });
  }

  const user = await User.findOne({ email });
  if (!user) {
    authLogger.warn("User not found with this email");
    return res.status(404).json({
      status: false,
      message: "User not found with this email",
    });
  }

  // Generate a password reset token and send it to the user's email
  // (Implementation of sending email is not included in this snippet)

  res.status(200).json({
    status: true,
    message: "Password reset link sent to your email",
  });
});
