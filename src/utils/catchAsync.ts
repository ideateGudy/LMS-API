import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wraps an async route handler to automatically catch errors and pass them to Express's error handler
 * @param fn The async route handler function to wrap
 * @returns A new route handler that automatically catches errors
 */
export const catchAsync = <  P = any,  ResBody = any,  ReqBody = any,  ReqQuery = any,  Locals extends Record<string, any> = Record<string, any>> (
  fn: (    req: Request<P, ResBody, ReqBody, ReqQuery, Locals>,     res: Response<ResBody, Locals>,    next: NextFunction  ) => Promise<any>): RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals> => {
  
    return (req: Request<P, ResBody, ReqBody, ReqQuery, Locals>, res: Response<ResBody, Locals>, next: NextFunction) => { Promise.resolve(fn(req, res, next)).catch(next);  };
};