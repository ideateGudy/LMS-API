import { celebrate, Segments, Joi } from 'celebrate';
import { RequestHandler } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

// Interface for registration body
interface IRegisterBody {
  username: string;
  email: string;
  role?: 'admin' | 'student' | 'instructor';
  password: string;
}

// Interface for login body
interface ILoginBody {
  email?: string;
  username?: string;
  password: string;
}

// Interface for forgot password body
interface IForgotPasswordBody {
  email: string;
}

// Interface for reset password
interface IResetPasswordBody {
  newPassword: string;
}

interface IResetPasswordQuery {
  token: string;
}

type TypedRequestHandler<B = any, Q extends ParsedQs = ParsedQs> = 
  RequestHandler<ParamsDictionary, any, B, Q, Record<string, any>>;

// Password validation helper
const passwordValidation = Joi.string()
  .min(8)
  .max(128)
  .required()
  .custom((value: string, helpers: Joi.CustomHelpers<string>) => {
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    if (!hasUpperCase) return helpers.error('password.uppercase');
    if (!hasLowerCase) return helpers.error('password.lowercase');
    if (!hasNumber) return helpers.error('password.number');
    if (!hasSymbol) return helpers.error('password.symbol');

    return value;
  })
  .messages({
    'string.min': 'Password must be at least 8 characters',
    'string.max': 'Password must not exceed 128 characters',
    'string.empty': 'Password cannot be empty',
    'any.required': 'Password is required',
    'password.uppercase': 'Password must contain at least one uppercase letter',
    'password.lowercase': 'Password must contain at least one lowercase letter',
    'password.number': 'Password must contain at least one number',
    'password.symbol': 'Password must contain at least one special character',
    'string.base': 'Password must be a string',
    'string.pattern.base':
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  });

export const registerValidation: TypedRequestHandler<IRegisterBody> = celebrate({
  [Segments.BODY]: Joi.object<IRegisterBody>({
    username: Joi.string()
      .min(3)
      .max(30)
      .pattern(/^[a-zA-Z][a-zA-Z0-9._]*$/)
      .required()
      .messages({
        'string.base': 'Username must be a string',
        'string.empty': 'Username is required',
        'string.min': 'Username must be at least 3 characters',
        'string.max': 'Username must not exceed 30 characters',
        'string.pattern.base':
          'Username must start with a letter and can only contain letters, numbers, underscores, or dots',
        'any.required': 'Username is required',
      }),
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email',
      'any.required': 'Email is required',
    }),
    role: Joi.string().valid('admin', 'student', 'instructor').messages({
      'any.only': "Role must be one of 'admin', 'student', or 'instructor'",
    }),
    password: passwordValidation,
  }),
});

export const loginValidation: TypedRequestHandler<ILoginBody> = celebrate({
  [Segments.BODY]: Joi.object<ILoginBody>({
    email: Joi.string().email().messages({
      'string.email': 'Please provide a valid email',
    }),
    username: Joi.string().messages({
      'string.base': 'Username must be a string',
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required',
    }),
  }).custom((value: ILoginBody, helpers: Joi.CustomHelpers<ILoginBody>) => {
    const { email, username } = value;

    if (!email && !username) {
      return helpers.error('any.custom', {
        message: 'email is required or username is required',
      });
    }

    if (email === '') {
      return helpers.error('any.custom', { message: 'email is required' });
    }

    if (username === '') {
      return helpers.error('any.custom', { message: 'username is required' });
    }

    return value;
  }).messages({
    'any.custom': '{{#message}}',
  }),
});

export const forgotPasswordValidation: TypedRequestHandler<IForgotPasswordBody> = celebrate({
  [Segments.BODY]: Joi.object<IForgotPasswordBody>({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email',
      'any.required': 'Email is required',
    }),
  }),
});

export const resetPasswordValidation: RequestHandler<
ParamsDictionary,
any,
IResetPasswordBody,
IResetPasswordQuery
>  = celebrate({
  [Segments.BODY]: Joi.object<IResetPasswordBody>({
    newPassword: passwordValidation,
  }),
  [Segments.QUERY]: Joi.object<IResetPasswordQuery>({
    token: Joi.string().required().messages({
      'string.empty': 'Token is required',
      'any.required': 'Token is required',
    }),
  }),
});