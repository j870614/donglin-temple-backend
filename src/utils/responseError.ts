import { Response } from "express";

import { AppError } from "./appError.js";

export const responseErrorDev = (err: AppError, res: Response) => {
  res.status(err.statusCode).send({
    status: false,
    message: err.message,
    err,
    stack: err.stack
  });
  res.end();
};

export const responseErrorProd = (err: AppError, res: Response) => {
  res.status(err.statusCode).send({
    status: false,
    error: err.message
  });
  res.end();
};
