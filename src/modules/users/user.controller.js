import { catchAsync } from "../../utils/catchAsync.js";
import User from "./user.model.js";
import { APIError } from "../../utils/errorClass.js";
import { logger } from "../../utils/logger.js";
const userLogger = logger.child({
  logIdentifier: "User Controller",
});

export const getUser = catchAsync(async (req, res) => {
  const userId = req.userId;
  const user = await User.findById(userId)
    .select("-password")
    .populate("courses");
  const courseCount = user.courses.length;
  if (!user) {
    userLogger.error("User not found", { userId });
    throw new APIError("User not found", 404);
  }

  if (req.user.role === "student") {
    userLogger.info("User is a student", { userId });
    return res.status(200).json({ status: true, data: { user } });
  }
  userLogger.info("User retrieved successfully", { userId });
  return res.status(200).json({ status: true, data: { courseCount, user } });
});

export const getUsers = catchAsync(async (req, res) => {
  const users = await User.find()
    .select("-password")
    .sort({ createdAt: -1 })
    .populate("courses");
  if (!users || users.length === 0) {
    userLogger.error("No users found");
    throw new APIError("No users found", 404);
  }
  const totalResult = users.length;
  userLogger.info("Users retrieved successfully", { count: users.length });

  return res.status(200).json({ status: true, totalResult, data: { users } });
});
