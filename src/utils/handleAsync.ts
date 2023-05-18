import { NextFunction, Request, Response } from "express";

export type AsyncRequestHandler<Req = Request, Res = Response> = (
  req: Req,
  res: Res,
  next: NextFunction
) => Promise<void>;

export type AsyncErrorRequestHandler<Req = Request, Res = Response> = (
  err: Error,
  req: Req,
  res: Res,
  next: NextFunction
) => Promise<void>;

export function handleAsync<Req = Request, Res = Response>(
  fn: AsyncRequestHandler<Req, Res>
) {
  return async (req: Req, res: Res, next: NextFunction) => {
    try {
      return await fn(req, res, next);
    } catch (err: unknown) {
      return next(err);
    }
  };
}

export function handleAsyncError<Req = Request, Res = Response>(
  fn: AsyncErrorRequestHandler<Req, Res>
) {
  return async (err: Error, req: Req, res: Res, next: NextFunction) => {
    try {
      return await fn(err, req, res, next);
    } catch (catchErr: unknown) {
      return next(catchErr);
    }
  };
}
