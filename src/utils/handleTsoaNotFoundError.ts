import { Response, Request } from "express";
import { responseNotFoundError } from "./responseTsoaError";

export const handleTsoaNotFoundError = (_req: Request, res: Response) => {
  responseNotFoundError(res);
};
