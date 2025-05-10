import { logger } from "../config/winston.js";
import { APIError } from "../utils/errorClass.js";
import jwt from "jsonwebtoken";
import { isCelebrateError } from "celebrate";
import { clearAuthCookies, REFRESH_PATH } from "../utils/setCookie.js";
import multer from "multer";

const errorHandlerLogger = logger.child({
  logIdentifier: "Global Error Handler Middleware",
});

export const globalErrorHandler = (err, req, res, next) => {
  // if (process.env.NODE_ENV === "development") {
  //   errorHandlerLogger.error("Error Handler", err.stack);
  // }

  if (req.path === REFRESH_PATH) {
    clearAuthCookies(res);
  }

  // Joi validation error
  if (isCelebrateError(err)) {
    // const passwordRequirements =
    //   "Password must be at least 8 characters, and include at least one uppercase letter, one lowercase letter, one number, and one special character.";

    errorHandlerLogger.warn("Validation Error", err);
    const bodyError = err.details.get("body");
    const queryError = err.details.get("query");
    const message =
      bodyError?.details?.[0]?.message ||
      queryError?.details?.[0]?.message ||
      "Validation failed";

    return res.status(400).json({ success: false, message });
  }

  if (err instanceof APIError) {
    errorHandlerLogger.error("APIError", {
      message: err.message,
      statusCode: err.statusCode,
      name: err.name,
      stack: err.stack,
    });

    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  }

  if (err instanceof multer.MulterError) {
    // Handle specific MulterError
    return res.status(400).json({
      error: err.message || "File upload failed",
      field: err.field,
    });
  }

  if (err instanceof jwt.TokenExpiredError) {
    errorHandlerLogger.error("TokenExpiredError", err);

    return res.status(401).json({
      success: false,
      message: "Token Expired",
    });
  } else if (err instanceof jwt.JsonWebTokenError) {
    errorHandlerLogger.error("JsonWebTokenError", err);
    return res.status(401).json({
      success: false,
      message: "Invalid Token.",
    });
  } else if (err instanceof jwt.NotBeforeError) {
    errorHandlerLogger.error("NotBeforeError", err);
    return res.status(401).json({
      success: false,
      message: "Token not active yet.",
    });
  }
  //Prisma errors
  if (err.code === "P2002") {
    errorHandlerLogger.error("Prisma Error", err);
    return res.status(409).json({
      success: false,
      message: `Duplicate: Unique constraint failed on the ${err.meta.target}`,
    });
  } else if (err.code === "P2025") {
    errorHandlerLogger.error("Prisma Error", err);
    return res.status(404).json({
      success: false,
      message: `Requested record not found or already deleted.`,
    });
  } else if (err.code === "P2003") {
    errorHandlerLogger.error("Prisma Error", err);
    return res.status(400).json({
      success: false,
      message: `Invalid relation or referenced record does not exist.`,
    });
  } else if (err.code === "P2016") {
    errorHandlerLogger.error("Prisma Error", err);
    return res.status(400).json({
      success: false,
      message: `The provided value for the column is too long for the column's type.`,
    });
  } else if (err.code === "P2021") {
    errorHandlerLogger.error("Prisma Error", err);
    return res.status(400).json({
      success: false,
      message: `The provided value for the column is not valid.`,
    });
  } else if (err.code === "P2000") {
    errorHandlerLogger.error("Prisma Error", err);
    return res.status(400).json({
      success: false,
      message: `The provided value for the column is not valid.`,
    });
  } else if (err.code === "P2018") {
    errorHandlerLogger.error("Prisma Error", err);
    return res.status(400).json({
      success: false,
      message: `The provided value for the column is not valid.`,
    });
  } else if (err.code === "P2024") {
    errorHandlerLogger.error("Prisma Error", err);
    return res.status(400).json({
      success: false,
      message: `The provided value for the column is not valid.`,
    });
  } else if (err.code === "P2023") {
    errorHandlerLogger.error("Prisma Error", err);
    return res.status(400).json({
      success: false,
      message: `The provided value for the column is not valid.`,
    });
  }

  // Handle other errors
  errorHandlerLogger.error("Internal Server Error", err);
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};
