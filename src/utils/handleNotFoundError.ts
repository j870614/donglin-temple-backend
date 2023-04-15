import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export const handleNotFoundError = (
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next?: NextFunction
) => {
  res.status(StatusCodes.NOT_FOUND).send({
    status: false,
    message: "The requested URL was not found on this server"
  });
  res.end();
};
