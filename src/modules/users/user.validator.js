import { celebrate, Segments } from "celebrate";
import Joi from "joi";

export const validateCourse = celebrate({
  [Segments.PARAMS]: Joi.object({
    courseId: Joi.string().required().messages({
      "string.empty": "Course Id is required",
      "any.required": "Course Id is required",
      "string.base": "Parameter must be a string",
    }),
  }),
});

export const updateUserValidation = celebrate({
  [Segments.BODY]: Joi.object({
    username: Joi.string()
      .min(3)
      .max(30)
      .pattern(/^[a-zA-Z][a-zA-Z0-9._]*$/)
      .messages({
        "string.base": "Username must be a string",
        "string.min": "Username must be at least 3 characters",
        "string.max": "Username must not exceed 30 characters",
        "string.pattern.base":
          "Username must start with a letter and can only contain letters, numbers, underscores, or dots",
        "any.required": "Username is required",
      }),

    email: Joi.string().email().messages({
      "string.email": "Please provide a valid email",
      "any.required": "Email is required",
    }),
  }),
});

export const updatePasswordValidation = celebrate({
  [Segments.BODY]: Joi.object({
    oldPassword: Joi.string().required().messages({
      "string.empty": "Old password is required",
      "any.required": "Old password is required",
      "string.base": "Old password must be a string",
    }),
    newPassword: Joi.string()
      .min(8)
      .max(128)
      .required()
      .custom((value, helpers) => {
        const hasUpperCase = /[A-Z]/.test(value);
        const hasLowerCase = /[a-z]/.test(value);
        const hasNumber = /\d/.test(value);
        const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(value);

        if (!hasUpperCase) {
          return helpers.error("password.uppercase");
        }
        if (!hasLowerCase) {
          return helpers.error("password.lowercase");
        }
        if (!hasNumber) {
          return helpers.error("password.number");
        }
        if (!hasSymbol) {
          return helpers.error("password.symbol");
        }

        return value;
      })
      .messages({
        "string.min": "Password must be at least 8 characters",
        "string.max": "Password must not exceed 128 characters",
        "string.empty": "Password cannot be empty",
        "any.required": "Password is required",
        "password.uppercase":
          "Password must contain at least one uppercase letter",
        "password.lowercase":
          "Password must contain at least one lowercase letter",
        "password.number": "Password must contain at least one number",
        "password.symbol":
          "Password must contain at least one special character",
        "string.base": "Password must be a string",
        "string.pattern.base":
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      }),
  }),
});
