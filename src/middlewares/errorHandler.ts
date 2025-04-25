import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.js";
import { APIError } from "../utils/errorClass.js";
import jwt, {
  TokenExpiredError,
  JsonWebTokenError,
  NotBeforeError,
} from "jsonwebtoken";
import { isCelebrateError, CelebrateError } from "celebrate";


const errorHandlerLogger = logger.child({
  logIdentifier: "Global Error Handler Middleware",
});

interface MongooseValidationError extends Error {
  name: "ValidationError";
  errors: Record<string, { message: string }>;
}

interface MongooseCastError extends Error {
  name: "CastError";
  path: string;
  value: string;
}

interface MongoDuplicateKeyError extends Error {
  code: number;
  keyValue: Record<string, unknown>;
}

export const globalErrorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  if (process.env.NODE_ENV === "development" && err instanceof Error) {
    errorHandlerLogger.error("APIError", {
      message: err.message,
      statusCode: (err as APIError).statusCode,
      name: err.name,
      stack: err.stack,
    });
  }

  // Joi validation error
  if (isCelebrateError(err)) {
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

  if (err instanceof TokenExpiredError) {
    errorHandlerLogger.error("TokenExpiredError", err);
    return res.status(401).json({
      status: false,
      message: "Token Expired. Please log in again.",
    });
  } else if (err instanceof JsonWebTokenError) {
    errorHandlerLogger.error("JsonWebTokenError", err);
    return res.status(401).json({
      status: false,
      message: "Invalid Token. Please log in again.",
    });
  } else if (err instanceof NotBeforeError) {
    errorHandlerLogger.error("NotBeforeError", err);
    return res.status(401).json({
      status: false,
      message: "Token not active yet.",
    });
  }

  if ((err as MongooseValidationError).name === "ValidationError") {
    const errors = Object.values(
      (err as MongooseValidationError).errors
    ).map((el) => el.message);
    errorHandlerLogger.error(errors.join(". ") + " Validation Error");

    return res.status(400).json({
      status: false,
      message: `Validation Error: ${errors.join(". ")}`,
    });
  }

  if ((err as MongooseCastError).name === "CastError") {
    errorHandlerLogger.error("CastError", err);
    return res.status(400).json({
      status: false,
      message: `Invalid ${(err as MongooseCastError).path}: ${
        (err as MongooseCastError).value
      }. Please provide a valid value.`,
    });
  }

  if ((err as MongoDuplicateKeyError).code === 11000) {
    errorHandlerLogger.error("Duplicate Key Error", err);
    return res.status(400).json({
      status: false,
      message: `Duplicate field value entered for ${Object.keys(
        (err as MongoDuplicateKeyError).keyValue
      )} field`,
    });
  }

  // Handle other errors
  errorHandlerLogger.error("Internal Server Error", err);

  return res.status((err as APIError).statusCode || 500).json({
    status: false,
    message: (err as Error).message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? null : (err as Error).stack,
  });
};