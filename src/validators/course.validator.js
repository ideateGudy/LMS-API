import { celebrate, Segments } from "celebrate";
import Joi from "joi";

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
    prerequisites: Joi.array().items(Joi.string()).messages({
      "array.base": "Prerequisites must be an array of strings",
    }),
    topic: Joi.string().required().messages({
      "string.empty": "Topic is required",
      "any.required": "Topic is required",
    }),
    language: Joi.string().required().messages({
      "string.empty": "Language is required",
      "any.required": "Language is required",
    }),
    subtitleLanguage: Joi.string().optional().allow(""),
    level: Joi.string()
      .valid("Beginner", "Intermediate", "Advanced")
      .required()
      .messages({
        "string.empty": "Level is required",
        "any.required": "Level is required",
        "any.only":
          "Level must be one of 'Beginner', 'Intermediate', or 'Advanced'",
      }),
    duration: Joi.number().integer().min(1).required().messages({
      "number.base": "Duration must be a number",
      "number.min": "Duration must be at least 1",
      "any.required": "Duration is required",
    }),
    material: Joi.string().required().messages({
      "string.empty": "Material is required",
      "any.required": "Material is required",
    }),
    promoVideo: Joi.string().uri().required().messages({
      "string.empty": "Promo video URL is required",
      "any.required": "Promo video URL is required",
      "string.uri": "Promo video URL must be a valid URI",
    }),
    targetAudience: Joi.string().required().messages({
      "string.empty": "Target audience is required",
      "any.required": "Target audience is required",
    }),
    requirements: Joi.string().required().messages({
      "string.empty": "Requirements are required",
      "any.required": "Requirements are required",
    }),
    curriculum: Joi.string().required().messages({
      "string.empty": "Curriculum is required",
      "any.required": "Curriculum is required",
    }),
    welcomeMessage: Joi.string().required().messages({
      "string.empty": "Welcome message is required",
      "any.required": "Welcome message is required",
    }),
    congratulationsMessage: Joi.string().required().messages({
      "string.empty": "Congratulations message is required",
      "any.required": "Congratulations message is required",
    }),
    submittedForReview: Joi.boolean().optional(),
    approved: Joi.boolean().optional(),
    rejected: Joi.boolean().optional(),
    completed: Joi.boolean().optional(),
    createdBy: Joi.string().optional(),
    instructors: Joi.array()
      .items(
        Joi.object({
          id: Joi.string().required(),
        })
      )
      .optional(),
    enrolledStudents: Joi.array()
      .items(
        Joi.object({
          id: Joi.string().required(),
        })
      )
      .optional(),
    modules: Joi.array()
      .items(
        Joi.object({
          title: Joi.string().required(),
          description: Joi.string().required(),
          moduleNumber: Joi.number().integer().min(1).required(),
          duration: Joi.number().integer().min(1).required(),
          material: Joi.string().required(),
          promoVideo: Joi.string().uri().required(),
          lessons: Joi.array()
            .items(
              Joi.object({
                title: Joi.string().required(),
                description: Joi.string().required(),
                videoUrl: Joi.string().uri().required(),
                lessonNumber: Joi.number().integer().min(1).required(),
                duration: Joi.number().integer().min(1).required(),
                material: Joi.string().required(),
              })
            )
            .optional(),
        })
      )
      .optional(),
  }),
});

export const courseQueryValid = celebrate({
  [Segments.QUERY]: Joi.object({
    category: Joi.string().optional(),
    skillLevel: Joi.string()
      .valid("Beginner", "Intermediate", "Advanced")
      .optional(),
    search: Joi.string().optional(),
    page: Joi.number().integer().min(1).default(1).optional(),
    limit: Joi.number().integer().min(1).default(10).optional(),
    sortBy: Joi.string()
      .valid("createdAt", "updatedAt", "title", "category")
      .default("createdAt")
      .optional(),
    sortOrder: Joi.string().valid("asc", "desc").default("desc").optional(),
  }),
});
