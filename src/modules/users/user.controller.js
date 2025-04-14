import { catchAsync } from "../../utils/catchAsync.js";
import User from "./user.model.js";
import { APIError } from "../../utils/errorClass.js";
import { logger } from "../../utils/logger.js";

export const getUser = catchAsync(async (req, res) => {
  const userId = req.userId;
  const user = await User.findById(userId).select("-password");
  if (!user) {
    logger.error("User not found", { userId });
    throw new APIError("User not found", 404);
  }
  logger.info("User retrieved successfully", { userId });
  return res.status(200).json({ user });
});
