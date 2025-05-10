import { transporter } from "../config/nodemailer.js";

export const sendMail = async ({ to, subject, html, text }) => {
  return await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
    text,
  });
};
