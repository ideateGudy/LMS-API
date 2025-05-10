import { PrismaClient } from "../../prisma/generated/prisma/client.js";
import { logger } from "../config/winston.js";

let prisma;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  // Prevent multiple instances in dev (hot reloading)
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

prisma
  .$connect()
  .then(() => logger.info("✅ Connected to the database successfully"))
  .catch((err) => {
    logger.error("❌ Failed to connect to the database", err);
    process.exit(1);
  });

export default prisma;
