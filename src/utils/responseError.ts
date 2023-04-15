import { Response } from "express";

import { AppError } from "./appError.js";

export const responseErrorDev = (err: AppError, res: Response) => {
  res.status(err.statusCode).send({
    status: false,
    err
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
