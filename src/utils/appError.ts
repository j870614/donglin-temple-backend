import { NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

export class AppError extends Error {
  statusCode: number;

  isOperational: boolean;

  constructor(errMessage: string) {
    super(errMessage);
    this.statusCode = StatusCodes.BAD_REQUEST;
    this.isOperational = true;
  }
}

export const appError = (
  httpStatus: number,
  errMessage: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next?: NextFunction
) => {
  const error = new AppError(errMessage);
  error.statusCode = httpStatus;
  error.isOperational = true;
  return error;
};
