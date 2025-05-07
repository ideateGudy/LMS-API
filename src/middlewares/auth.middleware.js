import jwt from "jsonwebtoken";
import { logger } from "../config/winston.js";
import { APIError } from "../utils/errorClass.js";

const authLogger = logger.child({
  logIdentifier: "Global Authentication Middleware",
});

// Middleware to check if the user is authenticated
export const authenticateUser = (req, res, next) => {
  authLogger.info("Hit Authentication Middleware");

  // Check if the request has an authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    authLogger.warn("Auth-Middleware: Authorization token is required");
    return next(new APIError("Authorization token is required", 401));
  }

  // Extract the token from the authorization header
  const accessToken = req.headers["authorization"]?.split(" ")[1];

  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    const date = new Date(decoded.exp * 1000);

    req.userId = decoded.userId;
    req.role = decoded.role; // Attach the user object to the request
    if (!req.userId) {
      authLogger.warn("Auth-Middleware: User not found");
      return next(new APIError("User not found", 404));
    }
    authLogger.info(`Auth-Middleware: User is Authenticated ${decoded.userId}`);

    next();
  } catch (err) {
    next(err);
  }
};

// Middleware to check if the user has a specific role
export const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.role)) {
      return res
        .status(403)
        .json({ status: false, message: "Forbidden: Access denied" });
    }
    next();
  };
