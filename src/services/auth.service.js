import prisma from "../lib/prismaClient.js";
import { logger } from "../config/winston.js";
import { APIError } from "../utils/errorClass.js";
import { hashPassword, comparePassword } from "../utils/bcrypt.js";

const authLogger = logger.child({
  logIdentifier: "Auth Controller",
});

//create user service-

export const createUser = async (userData) => {
  const { username, email, role, password } = userData;

  if (!username || !email || !password) {
    authLogger.warn("All fields are required");
    throw new APIError("All fields are required");
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
  });

  if (existingUser?.username === username) {
    authLogger.warn("User already exists with this username");
    throw new APIError(
      `User already exists with this username ${username}`,
      409
    );
  }

  if (existingUser?.email === email) {
    authLogger.warn("User already exists with this email");
    throw new APIError(`User already exists with this email ${email} `, 409);
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      role,
      password: hashedPassword,
    },
  });

  const { password: _, ...userWithoutPassword } = user;

  return userWithoutPassword;
};
