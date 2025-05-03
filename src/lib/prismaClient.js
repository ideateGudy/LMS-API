import fs from "fs";
import path from "path";

export const getPrismaClientSafely = async () => {
  try {
    const clientPath = path.join(
      process.cwd(),
      "node_modules",
      "@prisma",
      "client"
    );

    if (!fs.existsSync(clientPath)) {
      console.error(
        "Prisma Client is not generated. Run `npx prisma generate`."
      );
      throw new Error(
        "Prisma Client is not generated. Run `npx prisma generate`."
      );
    }

    // const { PrismaClient } = await import("@prisma/client");
    const { PrismaClient } = await import("../../generated/prisma/client");
    return new PrismaClient();
  } catch (error) {
    console.error("Prisma client failed to initialize:", error.message);
    throw error;
  }
};
