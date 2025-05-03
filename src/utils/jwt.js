import jwt from "jsonwebtoken";
// import { APIError } from "./errorClass.js";
// import {logger} from "./logger.js"

const JWT_SECRET = process.env.JWT_SECRET;

export const generateToken = (user, exAccess, exRefresh) => {
  const refreshToken = jwt.sign(
    {
      userId: user.id,
      username: user.username,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: exRefresh || "15m" }
  );
  const accessToken = jwt.sign(
    {
      userId: user.id,
      username: user.username,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: exAccess || "10d" }
  );

  return { refreshToken, accessToken };
};

export const generateEmailToken = (user, expires) => {
  return jwt.sign(
    {
      userId: user.id,
    },
    JWT_SECRET,
    { expiresIn: expires || "5m" }
  );
};
