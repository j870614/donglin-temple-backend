import { Response, Request } from "express";
import { responseNotFoundError } from "./responseError";

export const handleNotFoundError = (_req: Request, res: Response) => {
  responseNotFoundError(res);
};
