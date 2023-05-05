import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcryptjs";
import validator from "validator";

import { throwError } from "rxjs";
import { appError } from "../utils/appError";
import { responseSuccess } from "../utils/responseSuccess";
import { UserRequest } from "@/models/managers.model";
import { prisma } from "@/configs/prismaClient";

export class ManagersController {
  // constructor(
  //   private readonly _jwt: JwtService,
  //   private readonly _user: UserService
  // ) {}

  // login = async (req: UserRequest, res: Response, next: NextFunction) => {
  //   const { email, password } = req.body;

  //   if (!email || !password) {
  //     next(
  //       appError(StatusCodes.BAD_REQUEST, "Email and password are required")
  //     );
  //     return;
  //   }

  //   try {
  //     const user = await prisma.user.findUnique({ where: { email } });

  //     if (!user) {
  //       next(appError(StatusCodes.BAD_REQUEST, "User not found"));
  //     }

  //     if (password !== user?.password) {
  //       next(
  //         appError(StatusCodes.BAD_REQUEST, "Email or password is incorrect")
  //       );
  //       return;
  //     }

  //     await generateAndSendJwt(res, StatusCodes.OK, user);
  //   } catch (error) {
  //     next(error);
  //   }
  };
}
