import mongoose from "mongoose";
import { logger } from "../utils/logger.js";

export const connectDb = async () => {
  try {
    mongoose.connection.on("connected", () =>
      logger.info(`✅ DataBase Connected Successfully`)
    );
    await mongoose.connect(`${process.env.MONGO_URI}`);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    logger.error("MongoDB connection error:", error);
    process.exit(1);
  }
};
