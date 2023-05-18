import { Response, Request, NextFunction } from "express";
import { ValidateError } from "tsoa";
import { responseError, responseValidateError } from "./responseTsoaError";

export const handleTsoaError = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  if (err instanceof ValidateError) {
    console.warn(`Caught Validation Error for ${req.path}:`, err.fields);
    return responseValidateError(err, res);
  }

  if (err instanceof Error) {
    return responseError(err, res);
  }

  return next();
};
