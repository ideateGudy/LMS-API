import jwt from "jsonwebtoken";
import { logger } from "../utils/logger.js";
import { APIError } from "../utils/errorClass.js";

const authLogger = logger.child({
  logIdentifier: "Global Authentication Middleware",
});

// Middleware to check if the user is authenticated
export const verifyTokenMiddleware = (req, res, next) => {
  authLogger.info("Hit Authentication Middleware");
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    authLogger.warn("Auth-Middleware: Authorization token is required");
    return next(new APIError("Authorization token is required", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded._id;
    if (!req.userId) {
      authLogger.warn("Auth-Middleware: User not found");
      return next(new APIError("User not found", 404));
    }
    authLogger.info(`Auth-Middleware: User is Authenticated ${decoded._id}`);
    next();
  } catch (err) {
    next(err);
  }
};

// Middleware to check if the user has a specific role
export const checkRole = (role) => {
  authLogger.info("Hit Role Middleware");

  return (req, res, next) => {
    if (req.user.role !== role) {
      return next(
        new APIError("You do not have permission to access this resource", 403)
      );
    }
    next();
  };
};
