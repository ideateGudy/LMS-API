import { celebrate, Segments } from "celebrate";
import Joi from "joi";

export const percentageValidation = celebrate({
  [Segments.BODY]: Joi.object({
    percentage: Joi.number().required().messages({
      "string.empty": "Percentage is required",
      "any.required": "Percentage is required",
      "number.base": "Percentage must be a number",
      "number.min": "Percentage must be at least 0",
      "number.max": "Percentage must be at most 100",
    }),
  }),
});
