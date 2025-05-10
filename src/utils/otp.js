import crypto from "crypto";

export const generateOTP = () => {
  const otp = crypto.randomInt(1000, 9999).toString(); // Generate a random 4-digit OTP
  return otp;
};
