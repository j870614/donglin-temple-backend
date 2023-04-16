import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { AppError } from "./appError.js";
import { responseErrorDev, responseErrorProd } from "./responseError.js";

export const handleError = (
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next?: NextFunction
) => {
  const currentErr = err;

  currentErr.statusCode ||= StatusCodes.INTERNAL_SERVER_ERROR;

  if (process.env.NODE_ENV === "dev") {
    return responseErrorDev(currentErr, res);
  }

  if (currentErr.name === "ValidationError") {
    currentErr.message = "The input of form is wrong, please try again.";
    currentErr.isOperational = true;
    return responseErrorProd(currentErr, res);
  }

  return responseErrorProd(currentErr, res);
};
