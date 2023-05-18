import { Response } from "express";
import { ValidateError } from "tsoa";

import { StatusCodes } from "http-status-codes";
import { AppError } from "./appError.js";

// export const responseErrorDev = (err: unknown, res: Response) => {
//   res.status().send({
//     status: false,
//     message: err?.message,
//     err,
//     stack: err?.stack
//   });
//   res.end();
// };

export const responseErrorProd = (err: AppError, res: Response) => {
  res.status(err.statusCode).send({
    status: false,
    error: err.message
  });
  res.end();
};

export const responseValidateError = (err: ValidateError, res: Response) => {
  res.status(StatusCodes.UNPROCESSABLE_ENTITY).send({
    status: false,
    message: "驗證失敗",
    error: err.message,
    details: err?.fields
  });
  res.end();
};

export const responseError = (err: Error, res: Response) => {
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
    status: false,
    message: "內部服務器錯誤",
    error: err.message
  });
  res.end();
};

export const responseNotFoundError = (res: Response) => {
  res.status(StatusCodes.NOT_FOUND).send({
    status: false,
    message: "頁面不存在"
  });
};
