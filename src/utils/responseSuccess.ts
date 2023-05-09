import { Response } from "express";
import { StatusCodes } from "http-status-codes";

export const responseSuccess = (
  res: Response,
  statusCode: number = StatusCodes.OK,
  data?: unknown
) => {
  res.status(statusCode).send({
    status: true,
    data
  });
  res.end();
};
