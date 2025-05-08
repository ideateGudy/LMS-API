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
        "string.min": "New Password field must be at least 8 characters",
        "string.max": "New Password field must not exceed 128 characters",
        "string.empty": "New Password field cannot be empty",
        "any.required": "New Password field is required",
        "password.uppercase":
          "New Password field must contain at least one uppercase letter",
        "password.lowercase":
          "New Password field must contain at least one lowercase letter",
        "password.number":
          "New Password field must contain at least one number",
        "password.symbol":
          "New Password field must contain at least one special character",
        "string.base": "New Password field must be a string",
        "string.pattern.base":
          "New Password field must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      }),
  }),
});

export const getUsersValidator = celebrate({
  [Segments.QUERY]: Joi.object({
    page: Joi.number().integer().min(1).default(1).messages({
      "number.base": "Page must be a number",
      "number.integer": "Page must be an integer",
      "number.min": "Page must be at least 1",
    }),
    limit: Joi.number().integer().min(1).max(100).default(10).messages({
      "number.base": "Limit must be a number",
      "number.integer": "Limit must be an integer",
      "number.min": "Limit must be at least 1",
      "number.max": "Limit must not exceed 100",
    }),
    sortBy: Joi.string()
      .valid("username", "email", "role", "createdAt")
      .default("email")
      .messages({
        "any.only":
          "Sort by must be one of the following: username, email, role, createdAt",
      }),
    sortOrder: Joi.string().valid("asc", "desc").default("asc").messages({
      "any.only": "Sort order must be either 'asc' or 'desc'",
    }),
    search: Joi.string().optional().messages({
      "string.base": "Search must be a string",
    }),
    isDeactivated: Joi.boolean().optional().messages({
      "boolean.base": "isDeactivated must be a boolean",
      "any.required": "isDeactivated is required",
      "string.empty": "isDeactivated cannot be empty",
      "any.required": "isDeactivated is required",
      "string.base": "isDeactivated must be a string",
      "any.only": "isDeactivated must be either 'true' or 'false'",
    }),
    username: Joi.string().optional().messages({
      "string.base": "Username must be a string",
      "string.empty": "Username cannot be empty",
      "any.required": "Username is required",
    }),
    email: Joi.string().optional().messages({
      "string.base": "Email must be a string",
      "string.empty": "Email cannot be empty",
      "any.required": "Email is required",
    }),
    role: Joi.string().optional().messages({
      "string.base": "Role must be a string",
      "string.empty": "Role cannot be empty",
      "any.required": "Role is required",
    }),
  }),
});
