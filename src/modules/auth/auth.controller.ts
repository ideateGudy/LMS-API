import { Request, Response } from 'express';
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { catchAsync } from "../../utils/catchAsync";
import { logger } from "../../utils/logger";
import User, { IUser } from "../users/user.model";
import { APIError } from "../../utils/errorClass";
import { sendMail } from "../../utils/sendMail";

const authLogger = logger.child({
  logIdentifier: "Auth Controller",
});

// Type definitions
interface ITokenPayload extends JwtPayload {
  userId: string;
  username: string;
  role: string;
}

interface IRegisterBody {
  username: string;
  email: string;
  role?: 'student' | 'instructor' | 'admin';
  password: string;
}

interface ILoginBody {
  email?: string;
  username?: string;
  password: string;
}

interface IForgotPasswordBody {
  email: string;
}

interface IResetPasswordBody {
  newPassword: string;
}

interface IResetPasswordQuery {
  token?: string;
}

// Validate JWT_SECRET
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

// Generate JWT token
const generateToken = (user: IUser, duration: string = "1d"): string => {
    const payload: ITokenPayload = {
      userId: user._id.toString(), // Explicitly convert to string
      username: user.username,
      role: user.role
    };
  
    const options: SignOptions = {
      expiresIn: '1d'
    };
  
    return jwt.sign(payload, JWT_SECRET, options);
  };

export const registerUser = catchAsync(async (req: Request<{}, {}, IRegisterBody>, res: Response) => {
  const { username, email, role = 'student', password } = req.body;

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
      message: `User already exists with this email ${email}`,
    });
  }

  const user = await User.create({ username, email, role, password });
  const { password: _, ...userWithoutPassword } = user.toObject();

  res.status(201).json({
    message: "User registered successfully",
    data: { user: userWithoutPassword },
  });
});

export const loginUser = catchAsync(async (req: Request<{}, {}, ILoginBody>, res: Response) => {
  const { email, username, password } = req.body;
  
  if (!email && !username) {
    throw new APIError("Email or username is required", 400);
  }

  const user = await User.login(email || username!, password);
  const token = generateToken(user);
  const { password: _, ...userWithoutPassword } = user.toObject();
  
  res.status(200).json({
    status: true,
    message: "User login successful",
    data: { user: userWithoutPassword, token },
  });
});

export const forgotPassword = catchAsync(async (req: Request<{}, {}, IForgotPasswordBody>, res: Response) => {
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

  const token = generateToken(user, "5m");
  const resetUrl = process.env.NODE_ENV === "production"
    ? `https://dive-africa-lms-backend.onrender.com/api/auth/reset-password?token=${token}`
    : `http://localhost:3000/api/auth/reset-password?token=${token}`;
  
  const sent = await sendMail(
    user.email,
    "Password Reset",
    `Click to reset: ${resetUrl}`
  );

  res.status(200).json({
    status: true,
    message: `Password reset link sent to ${sent}`,
  });
});

export const resetPassword = catchAsync(async (
  req: Request<{}, {}, IResetPasswordBody, IResetPasswordQuery>, 
  res: Response
) => {
  const { newPassword } = req.body;
  const { token } = req.query;

  if (!token) {
    throw new APIError("Token is required", 400);
  }

  const decoded = jwt.verify(token, JWT_SECRET) as ITokenPayload;
  const user = await User.findById(decoded.userId);

  if (!user) throw new APIError("User not found", 404);

  const isMatch = await user.comparePassword(newPassword);
  if (isMatch) {
    throw new APIError("New password cannot be the same as old password", 400);
  }

  user.password = newPassword;
  await user.save();

  res.json({ status: true, message: "Password has been reset successfully" });
});