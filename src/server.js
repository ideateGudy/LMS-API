import "dotenv/config";
import { logger } from "./utils/logger.js";
// import { connectDb } from "./config/db.js";

import app from "./app.js";
const PORT = process.env.PORT || 3000;

// ----------------- TEST------------------------------------//
//throw sync error
// throw new Error("An uncaught error");

//throw async error
// setTimeout(() => {
//   Promise.reject(new Error("💥 Unhandled rejection test"));
// }, 1000);
// ----------------- TEST ENDS HERE------------------------------------//
// logger.info("Logger initialized successfully");
// logger.warn("Warning message logged");
// logger.error("Error message logged");

app.listen(PORT, () => {
  try {
    // connectDb();
    logger.info(`Server is running on port ${PORT}`);
  } catch (error) {
    logger.error("Error starting server:", error);
    process.exit(1);
  }
});
