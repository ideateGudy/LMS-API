import resend from "../config/resend.js";

const NODE_ENV = process.env.NODE_ENV || "development";
const EMAIL_SENDER = process.env.RESEND_EMAIL_SENDER;

const getFromEmail = () =>
  NODE_ENV === "development" ? "onboarding@resend.dev" : EMAIL_SENDER;
const getToEmail = () =>
  NODE_ENV === "development" ? "delivered@resend.dev" : to;

// const EMAIL_RECIPIENT = "delivered@resend.dev";

export const sendEmail = async ({ to, subject, html, text }) => {
  return await resend.emails.send({
    from: getFromEmail(),
    to: getToEmail(to),
    subject,
    html,
    text,
  });
};
