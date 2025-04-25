import mongoose from 'mongoose';
import { logger } from '../utils/logger';

/**
 * Connects to MongoDB database and sets up event listeners
 * @throws {Error} If connection fails
 */
export const connectDb = async (): Promise<void> => {
  const MONGO_URI = process.env.MONGO_URI;
  const DB_NAME = process.env.DB_NAME;

  // Validate environment variables
  if (!MONGO_URI || !DB_NAME) {
    const errorMsg = 'MongoDB connection credentials missing in environment variables';
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }

  // Configure connection options
  const connectionOptions: mongoose.ConnectOptions = {
    dbName: DB_NAME,
    retryWrites: true,
    w: 'majority'
  };

  try {
    // Setup event listeners
    mongoose.connection.on('connected', () => {
      logger.info(`✅ MongoDB connected to database: ${DB_NAME}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('❌ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('♻️ MongoDB reconnected');
    });

    mongoose.connection.on('error', (error: Error) => {
      logger.error(`❌ MongoDB connection error: ${error.message}`);
    });

    // Establish connection
    await mongoose.connect(MONGO_URI, connectionOptions);

  } catch (error: unknown) {
    let errorMessage = 'Unknown MongoDB connection error';
    
    if (error instanceof Error) {
      errorMessage = `MongoDB connection failed: ${error.message}`;
      logger.error(errorMessage, { stack: error.stack });
    } else if (typeof error === 'string') {
      errorMessage = `MongoDB connection failed: ${error}`;
      logger.error(errorMessage);
    }

    // Graceful shutdown if in production
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      throw new Error(errorMessage);
    }
  }
};

/**
 * Gracefully closes MongoDB connection
 */
export const disconnectDb = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`Error closing MongoDB connection: ${error.message}`);
    }
  }
};