import prisma from "../lib/prismaClient.js";
import { logger } from "../config/winston.js";
import { APIError } from "../utils/errorClass.js";
import { hashPassword, comparePassword } from "../utils/bcrypt.js";
import { generateOTP } from "../utils/otp.js";
import jwt from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import { sendActivationCodeTemplate } from "../utils/emailTemplates.js";
import { sendEmail } from "../utils/sendEmail.js";
import { sendMail } from "../utils/sendMail.js";

const authLogger = logger.child({
  logIdentifier: "Auth Service",
});

const ACTIVATION_SECRET = process.env.ACTIVATION_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
// const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

//---------------------------------------------------starts-------------------------------------------------------//

//check if user exists

const checkUserExists = async (username, email) => {
  return await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
  });
};

//createActivationToken
const createActivationToken = (user) => {
  const activationCode = generateOTP();

  const token = jwt.sign({ user, activationCode }, ACTIVATION_SECRET, {
    expiresIn: "5m",
  });

  return { token, activationCode };
};

//verifyUserData
const verifyUserData = async (userData) => {
  const { username, email, role, password } = userData;
  if (!username || !email || !role || !password) {
    authLogger.warn("All fields are required");
    throw new APIError("All fields are required");
  }

  const existingUser = await checkUserExists(username, email);

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

  return true;
};

export const getJwtAudience = (role) => {
  let audience;

  if (role === "admin") {
    authLogger.info("Admin login successful");
    audience = "admin";
  } else if (role === "student") {
    authLogger.info("Student login successful");
    audience = "student";
  } else if (role === "instructor") {
    authLogger.info("Instructor login successful");
    audience = "instructor";
  }

  return audience;
};

//-----------------------------------------------ends-----------------------------------------------------------//

//Send verification code

export const sendVerificationCode = async (userData) => {
  await verifyUserData(userData);

  const activationToken = createActivationToken(userData);
  const activationCode = activationToken.activationCode;

  //send email test with resend
  // const { error } = await sendEmail({
  //   to: userData.email,
  //   ...sendActivationCodeTemplate(activationCode),
  // });

  const { rejected } = await sendMail({
    to: userData.email,
    ...sendActivationCodeTemplate(activationCode),
  });

  if (rejected.length > 0) {
    authLogger.error("Error sending activation code", rejected);
    throw new APIError("Error sending activation code", 500);
  }

  authLogger.info("Email sent successfully", {
    email: userData.email,
    activationCode,
  });
  //return
  return activationToken.token;
};

//create user account

export const createUser_S = async (userData, userId) => {
  const { username, email, role, password } = userData;

  await verifyUserData(userData);

  const hashedPassword = await hashPassword(password);

  const createdBy = userId ? userId : null;

  const user = await prisma.user.create({
    data: {
      username,
      email,
      role,
      createdBy,
      password: hashedPassword,
    },
  });

  const { password: _, ...safeUser } = user;

  return safeUser;
};

//authenticate user
export const authUser_S = async (userData) => {
  const { username, email, password } = userData;

  if ((!username && !email) || !password) {
    authLogger.warn("All fields are required");
    throw new APIError("All fields are required", 400);
  }

  const user = await checkUserExists(username, email);

  if (!user) throw new APIError("User not found", 404);

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw new APIError("Incorrect Password", 401);
  }

  const { password: _, ...safeUser } = user;

  return safeUser;
};

export const handleRefreshTokenService = async (refreshToken) => {
  if (!refreshToken) throw new APIError("Refresh token is required", 401);
  // authLogger.info("Refresh token received", refreshToken);

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
  } catch (err) {
    throw new APIError("Refresh Token Expired", 401);
  }

  const secondsInDays = (days) => days * 24 * 60 * 60;

  const now = Math.floor(Date.now() / 1000);
  const timeLeft = decoded.exp - now;
  const needsNewRefresh = timeLeft < secondsInDays(3);

  const session = await prisma.session.findUnique({
    where: { id: decoded.sessionId },
  });
  if (!session) throw new APIError("Session not found", 404);
  if (session.expiresAt < new Date()) {
    authLogger.warn("Session expired", session.expiresAt);
    throw new APIError("Session expired", 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user) throw new APIError("User not found", 404);

  const audience = getJwtAudience(user.role);

  const accessToken = generateAccessToken(user, session.userId, audience);
  let newRefreshToken = null;

  if (needsNewRefresh) {
    newRefreshToken = generateRefreshToken(session.id, audience);
  }

  return { accessToken, newRefreshToken };
};
