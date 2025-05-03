import "dotenv/config";
import { logger } from "./config/winston.js";

import app from "./app.js";
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  try {
    logger.info(`Server is running on port ${PORT}`);
  } catch (error) {
    logger.error("Error starting server:", error);
    process.exit(1);
  }
});
