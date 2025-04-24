import nodemailer from "nodemailer";
import "dotenv/config";
import { SentMessageInfo } from 'nodemailer';

// Define types for email options
interface MailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
}

// Configure transporter with type safety
const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER as string, // Type assertion for environment variables
    pass: process.env.EMAIL_PASS as string,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

/**
 * Sends an OTP email to the specified address
 * @param email Recipient email address
 * @param otp The OTP code to send
 * @returns Promise resolving to the recipient email
 * @throws Error if sending fails
 */
export const sendOTP = async (email: string, otp: string): Promise<string> => {
  const mailOptions: MailOptions = {
    from: '"Support" <support@gudymedia.com>',
    to: email,
    subject: "Your OTP Code",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your OTP Code</title>
          <style>
              body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
              .container { max-width: 500px; margin: 20px auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); text-align: center; }
              h1 { color: #333; }
              .otp-code { font-size: 24px; font-weight: bold; color: #007BFF; background: #f1f1f1; padding: 10px; border-radius: 5px; display: inline-block; margin: 10px 0; }
              p { font-size: 16px; color: #555; }
              .footer { margin-top: 20px; font-size: 12px; color: #888; }
          </style>
      </head>
      <body>
      <div class="container">
          <h1>Your OTP Code</h1>
          <p>Use the OTP below to complete your verification. This code will expire in 5 minutes.</p>
          <div class="otp-code">${otp}</div>
          <p>If you did not request this OTP, please ignore this email.</p>
          <div class="footer">
              &copy; 2025 Gudy Media. All rights reserved.
          </div>
      </div>
      </body>
      </html>
    `,
  };

  try {
    const info: SentMessageInfo = await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email} | Message ID: ${info.messageId}`);
    return email;
  } catch (err: unknown) {
    console.error("Failed to send OTP:", err);
    throw new Error("Failed to send OTP. Please try again.");
  }
};

/**
 * Sends a custom email to the specified address
 * @param email Recipient email address
 * @param subject Email subject line
 * @param message HTML content to send
 * @returns Promise resolving to the recipient email
 * @throws Error if sending fails
 */
export const sendMail = async (
  email: string,
  subject: string,
  message: string
): Promise<string> => {
  const mailOptions: MailOptions = {
    from: '"Reset Password" <support@gudymedia.com>',
    to: email,
    subject: subject,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
              body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
              .container { max-width: 500px; margin: 20px auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); text-align: center; }
              h1 { color: #333; }
              p { font-size: 16px; color: #555; }
              .footer { margin-top: 20px; font-size: 12px; color: #888; }
          </style>
      </head>
      <body>
      <div class="container">
          <h1>${subject}</h1>
          <p>${message}</p>
          <div class="footer">
              &copy; 2025 Gudy Media. All rights reserved.
          </div>
      </div>
      </body>
      </html>
    `,
  };

  try {
    const info: SentMessageInfo = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${email} | Message ID: ${info.messageId}`);
    return email;
  } catch (err: unknown) {
    console.error("Failed to send email:", err);
    throw new Error("Failed to send email. Please try again.");
  }
};