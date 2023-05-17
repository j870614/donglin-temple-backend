import { NextFunction, Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { StatusCodes } from "http-status-codes";
import jwt, { JwtPayload } from "jsonwebtoken";

import { ManagerRequestBody } from "../../models/managers.model";
import { responseSuccess } from "../../utils/responseSuccess";
import { appError } from "../../utils/appError";
import { prisma } from "../../configs/prismaClient";

const JWT_SECRET = process.env.JWT_SECRET || "default-secret";
const JWT_EXPIRATION = "7d";

interface AuthRequest
  extends Request<ParamsDictionary, object, ManagerRequestBody> {
  manager?: ManagerRequestBody;
}

export const generateAndSendJWT = (manager: ManagerRequestBody) => {
  const { Id, Email } = manager;
  const token = jwt.sign({ Id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION
  });
  const { exp } = jwt.decode(token) as JwtPayload;

  return { Email, token, expired: exp };
};

export const isAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer")) {
    next(
      appError(
        StatusCodes.UNAUTHORIZED,
        "Authorization header is missing",
        next
      )
    );
    return;
  }

  const [, token] = authorization.split(" ");

  if (!token) {
    next(appError(StatusCodes.UNAUTHORIZED, "Token is missing", next));
    return;
  }

  const decoded = jwt.verify(token, JWT_SECRET);
  if (typeof decoded === "string") {
    next(appError(StatusCodes.UNAUTHORIZED, "Token verify failed", next));
    return;
  }

  try {
    const currentManager = await prisma.managers.findUnique({
      where: { Id: Number(decoded.Id) }
    });

    if (!currentManager) {
      next(appError(StatusCodes.UNAUTHORIZED, "Invalid token", next));
      return;
    }

    req.user = currentManager;

    next();
  } catch (error: unknown) {
    if (error instanceof Error) throw error;
    throw new Error("Unexpected error in managers signIn");
  }
};
