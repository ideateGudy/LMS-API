export const getPrismaClientSafely = async () => {
  try {
    const { PrismaClient } = await import("@prisma/client");
    return new PrismaClient();
  } catch (error) {
    console.error("Prisma client failed to initialize:", error.message);
    // Optionally rethrow or handle
    throw error;
  }
};
