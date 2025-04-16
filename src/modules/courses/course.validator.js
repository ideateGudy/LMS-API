import { celebrate, Segments } from "celebrate";
import Joi from "joi";

export const getCourseValidation = celebrate({
  [Segments.QUERY]: Joi.object({
    courseId: Joi.string().messages({
      "string.base": "Query parameter must be a string",
    }),
  }),
});
export const enrollCourseValidation = celebrate({
  [Segments.PARAMS]: Joi.object({
    courseId: Joi.string().required().messages({
      "string.empty": "Course Id is required",
      "any.required": "Course Id is required",
      "string.base": "Parameter must be a string",
    }),
  }),
});

export const createCourseValidation = celebrate({
  [Segments.BODY]: Joi.object({
    title: Joi.string().required().messages({
      "string.empty": "Title is required",
      "any.required": "Title is required",
    }),
    description: Joi.string().required().messages({
      "string.empty": "Description is required",
      "any.required": "Description is required",
    }),
    category: Joi.string().required().messages({
      "string.empty": "Category is required",
      "any.required": "Category is required",
    }),
    skillLevel: Joi.string()
      .valid("Beginner", "Intermediate", "Advanced")
      .required()
      .messages({
        "string.empty": "Skill level is required",
        "any.required": "Skill level is required",
        "any.only":
          "Skill level must be one of 'Beginner', 'Intermediate', or 'Advanced'",
      }),
  }),
});
