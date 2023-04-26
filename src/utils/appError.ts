import { NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

export class AppError extends Error {
  public statusCode: number;

  public isOperational: boolean;

  constructor(
    errMessage: string,
    statusCode: number = StatusCodes.BAD_REQUEST,
    isOperational = true
  ) {
    super(errMessage);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
  }
}

export const appError = (
  httpStatus: number,
  errMessage: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next?: NextFunction
) => {
  const currentError = new AppError(errMessage, httpStatus, true);
  return currentError;
};
