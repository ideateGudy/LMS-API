import { logger } from "../utils/logger.js";
import { APIError } from "../utils/errorClass.js";
import jwt from "jsonwebtoken";
import { isCelebrateError } from "celebrate";

const errorHandlerLogger = logger.child({
  logIdentifier: "Global Error Handler Middleware",
});

export const globalErrorHandler = (err, req, res, next) => {
  // if (process.env.NODE_ENV === "development") {
  //   errorHandlerLogger.error("APIError", {
  //     message: err.message,
  //     statusCode: err.statusCode,
  //     name: err.name,
  //     stack: err.stack,
  //   });
  // }

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

    return res.status(400).json({ status: false, message });
  }

  if (err instanceof APIError) {
    errorHandlerLogger.error("APIError", {
      message: err.message,
      statusCode: err.statusCode,
      name: err.name,
      stack: err.stack,
    });

    return res.status(err.statusCode || 500).json({
      status: false,
      message: err.message,
    });
  }

  if (err instanceof jwt.TokenExpiredError) {
    errorHandlerLogger.error("TokenExpiredError", err);

    return res.status(401).json({
      status: false,
      message: "Token Expired.",
    });
  } else if (err instanceof jwt.JsonWebTokenError) {
    errorHandlerLogger.error("JsonWebTokenError", err);
    return res.status(401).json({
      status: false,
      message: "Invalid Token.",
    });
  } else if (err instanceof jwt.NotBeforeError) {
    errorHandlerLogger.error("NotBeforeError", err);
    return res.status(401).json({
      status: false,
      message: "Token not active yet.",
    });
  } else if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((el) => el.message);
    errorHandlerLogger.error(errors.join(". ") + " Validation Error");
    return res.status(400).json({
      status: false,
      message: `Validation Error: ${errors.join(". ")}`,
    });
  } else if (err.name === "CastError") {
    errorHandlerLogger.error("CastError", err);
    return res.status(400).json({
      status: false,
      message: `Invalid ${err.path}: ${err.value}. Please provide a valid value.`,
    });
  } else if (err.code === 11000) {
    // errorHandlerLogger.error(err);
    errorHandlerLogger.error("Duplicate Key Error", err);
    return res.status(400).json({
      status: false,
      message: `Duplicate field value entered for ${Object.keys(
        err.keyValue
      )} field`,
    });
  }

  // Handle other errors
  errorHandlerLogger.error("Internal Server Error", err);
  return res.status(err.status || 500).json({
    status: false,
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};
