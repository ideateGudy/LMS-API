export class APIError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly name: string = "APIError";
  
    constructor(message: string, statusCode: number) {
      super(message);
  
      // Maintains proper prototype chain for TypeScript
      Object.setPrototypeOf(this, new.target.prototype);
  
      this.statusCode = statusCode;
      this.isOperational = true;
  
      // Captures stack trace (excluding constructor call)
      Error.captureStackTrace(this, this.constructor);
    }
  
    // Optional: Add static factory methods for common errors
    static badRequest(message: string): APIError {
      return new APIError(message, 400);
    }
  
    static unauthorized(message: string): APIError {
      return new APIError(message, 401);
    }
  
    static notFound(message: string): APIError {
      return new APIError(message, 404);
    }
  
    static internalServerError(message: string): APIError {
      return new APIError(message, 500);
    }
  
    // Optional: Serialization method for API responses
    toJSON() {
      return {
        success: false,
        error: {
          name: this.name,
          statusCode: this.statusCode,
          message: this.message,
          isOperational: this.isOperational,
          // stack: this.stack // Only include in development
        }
      };
    }
  }