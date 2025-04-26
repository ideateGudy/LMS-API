import jwt, { JwtPayload } from "jsonwebtoken";
import { logger } from "../utils/logger.js";
import { APIError } from "../utils/errorClass.js";
import { Request, Response, NextFunction } from "express";

interface DecodedToken extends JwtPayload {
  userId: string;
  role?: string;
  [key: string]: any;
}

interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: DecodedToken;
}

const authLogger = logger.child({
  logIdentifier: "Global Authentication Middleware",
});

// Middleware to check if the user is authenticated
export const authenticateUser = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  authLogger.info("Hit Authentication Middleware");

  // Check if the request has an authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    authLogger.warn("Auth-Middleware: Authorization token is required");
    return next(new APIError("Authorization token is required", 401));
  }

  // Extract the token from the authorization header
  const token = authHeader.split(" ")[1];
  
  if (!token) {
    authLogger.warn("Auth-Middleware: Token not found in authorization header");
    return next(new APIError("Token not found in authorization header", 401));
  }

  try {
    // Verify the token - we know token is string at this point
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    
    // Type guard to ensure decoded is object with userId
    if (typeof decoded === "string" || !decoded || !("userId" in decoded)) {
      authLogger.warn("Auth-Middleware: Invalid token payload");
      return next(new APIError("Invalid token payload", 401));
    }

    // Now we can safely assign
    req.userId = decoded.userId;
    req.user = decoded as DecodedToken;
    
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
export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user?.role || !roles.includes(req.user.role)) {
      res
        .status(403)
        .json({ status: false, message: "Forbidden: Access denied" });

      return ;
    }
    next();
  };
};