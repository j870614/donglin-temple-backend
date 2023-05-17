import { Request, Response, NextFunction } from "express";

interface TsoaRequest extends Request {
  stringValue?: string;
}

export const parseTsoaRequest = (
  req: TsoaRequest,
  _res: Response,
  next: NextFunction
) => {
  req.stringValue = "fancyStringForContext";
  next();
};
