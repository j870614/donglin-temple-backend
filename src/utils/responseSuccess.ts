import { Response } from "express";
import { StatusCodes } from "http-status-codes";

export const responseSuccess = (res: Response, data?: unknown) => {
  res.status(StatusCodes.OK).send({
    status: true,
    data
  });
  res.end();
};
