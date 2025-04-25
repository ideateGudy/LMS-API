import "dotenv/config";
import { logger } from "./utils/logger";
import { connectDb } from "./config/db";
import app from "./app";

// Validate environment variables
const PORT: number = parseInt(process.env.PORT as string, 10) || 3000;
const NODE_ENV: string = process.env.NODE_ENV || "development";

// Server startup function
const startServer = async (): Promise<void> => {
  try {
    // Connect to database first
    await connectDb();
    
    const server = app.listen(PORT, () => {
      logger.info(`Server running in ${NODE_ENV} mode on port ${PORT}`);
    });

    // Handle graceful shutdown
    process.on("SIGTERM", () => {
      logger.info("SIGTERM received. Shutting down gracefully...");
      server.close(() => {
        logger.info("Server closed");
        process.exit(0);
      });
    });

    process.on("SIGINT", () => {
      logger.info("SIGINT received. Shutting down gracefully...");
      server.close(() => {
        logger.info("Server closed");
        process.exit(0);
      });
    });

  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`Failed to start server: ${error.message}`, { stack: error.stack });
    } else {
      logger.error("Unknown error occurred while starting server");
    }
    process.exit(1);
  }
};

// Start the server
startServer();