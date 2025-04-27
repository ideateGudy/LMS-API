import { celebrate, Segments } from "celebrate";
import Joi from "joi";
import { RequestHandler } from "express";

interface IPercentageBody {
  percentage: number;
}

export const percentageValidation: RequestHandler = celebrate({
  [Segments.BODY]: Joi.object({
    percentage: Joi.number()
      .required()
      .min(0)
      .max(100)
      .messages({
        "number.empty": "Percentage is required",
        "any.required": "Percentage is required",
        "number.base": "Percentage must be a number",
        "number.min": "Percentage must be at least 0",
        "number.max": "Percentage must be at most 100",
      }),
  }),
});