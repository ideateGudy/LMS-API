import { celebrate, Segments, Joi } from "celebrate";

interface ICourseParams {
  courseId: string;
}

interface IUpdateUserBody {
  username?: string;
  email?: string;
}

interface IUpdatePasswordBody {
  oldPassword: string;
  newPassword: string;
}

export const validateCourse = celebrate<{ params: ICourseParams }>({
  [Segments.PARAMS]: Joi.object<ICourseParams>({
    courseId: Joi.string().required().messages({
      "string.empty": "Course Id is required",
      "any.required": "Course Id is required",
      "string.base": "Parameter must be a string",
    }),
  }),
});

export const updateUserValidation = celebrate<{ body: IUpdateUserBody }>({
  [Segments.BODY]: Joi.object<IUpdateUserBody>({
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

export const updatePasswordValidation = celebrate<{ body: IUpdatePasswordBody }>({
  [Segments.BODY]: Joi.object<IUpdatePasswordBody>({
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