import { transporter } from "../config/nodemailer.js";

export const sendOTP = async (email, otp) => {
  const mailOptions = {
    from: "diveAfrica",
    to: email,
    subject: "Your OTP Code",
    // text: `Your OTP code is: ${otp}. It will expire in 5 minutes.`,
    // html: `<h1>Your OTP code is: ${otp}. It will expire in 5 minutes.</h1>`,
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
                &copy; 2025 Dive Africa. All rights reserved.
            </div>
        </div>
        </body>
        </html>
    `,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    return email;
  } catch (err) {
    console.error("Failed to send OTP:", err);
    throw new Error("Failed to send OTP. Please try again.");
  }
};

export const sendMail = async (email, subject, message) => {
  const mailOptions = {
    from: '"Reset Password" <support@diveafrica.com>',
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
                &copy; 2025 Dive Africa. All rights reserved.
            </div>
        </div>
        </body>
        </html>
    `,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    return email;
  } catch (err) {
    console.error("Failed to send email:", err);
    throw new Error("Failed to send email. Please try again.");
  }
};
