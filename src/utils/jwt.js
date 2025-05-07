import jwt from "jsonwebtoken";
// import { APIError } from "./errorClass.js";
// import {logger} from "./logger.js"

const EMAIL_JWT_SECRET = process.env.EMAIL_JWT_SECRET;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const ACCESS_TOKEN_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES;
const REFRESH_TOKEN_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES;

export const generateAccessToken = (user, sessionId, aud) => {
  return jwt.sign(
    {
      userId: user.id,
      username: user.username,
      role: user.role,
      sessionId,
    },
    ACCESS_TOKEN_SECRET,
    { audience: [`${aud}`], expiresIn: ACCESS_TOKEN_EXPIRES || "15m" }
  );
};
export const generateRefreshToken = (sessionId, aud) => {
  return jwt.sign(
    {
      sessionId,
    },
    REFRESH_TOKEN_SECRET,
    { audience: [`${aud}`], expiresIn: REFRESH_TOKEN_EXPIRES || "10d" }
  );
};

export const generateEmailToken = (user, expires) => {
  return jwt.sign(
    {
      userId: user.id,
    },
    EMAIL_JWT_SECRET,
    { expiresIn: expires || "5m" }
  );
};
