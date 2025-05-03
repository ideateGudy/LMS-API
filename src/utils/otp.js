import crypto from "crypto";

export const generateOTP = () => {
  const otp = crypto.randomInt(100000, 999999).toString(); // Generate a random 6-digit OTP
  console.log("otp is: ", otp);
  return otp;
};
