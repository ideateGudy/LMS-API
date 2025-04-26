import { celebrate, Segments, Joi } from "celebrate";
import { RequestHandler } from "express";

interface ICreateCourseBody {
  title: string;
  description: string;
  category: string;
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  prerequisites?: string[];
}

interface ICourseQuery {
  courseId?: string;
}


export const createCourseValidation: RequestHandler = celebrate({
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
  }),
});

// export const createCourseValidation = celebrate<{ body: ICreateCourseBody }>({
//   [Segments.BODY]: Joi.object<ICreateCourseBody>({
//     title: Joi.string().required().messages({
//       "string.empty": "Title is required",
//       "any.required": "Title is required",
//     }),
//     description: Joi.string().required().messages({
//       "string.empty": "Description is required",
//       "any.required": "Description is required",
//     }),
//     category: Joi.string().required().messages({
//       "string.empty": "Category is required",
//       "any.required": "Category is required",
//     }),
//     skillLevel: Joi.string()
//       .valid("Beginner", "Intermediate", "Advanced")
//       .required()
//       .messages({
//         "string.empty": "Skill level is required",
//         "any.required": "Skill level is required",
//         "any.only":
//           "Skill level must be one of 'Beginner', 'Intermediate', or 'Advanced'",
//       }),
//     prerequisites: Joi.array().items(Joi.string()).messages({
//       "array.base": "Prerequisites must be an array of strings",
//     }),
//   }),
// });

export const courseQueryValid = celebrate<{ query: ICourseQuery }>({
  [Segments.QUERY]: Joi.object<ICourseQuery>({
    courseId: Joi.string().messages({
      "string.base": "Query parameter must be a string",
    }),
  }),
});