/* eslint-disable class-methods-use-this */
import { Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import {
  Body,
  Controller,
  Get,
  Post,
  Queries,
  Query,
  Route,
  SuccessResponse,
  Tags
} from "tsoa";
import bcrypt from "bcryptjs";
import validator from "validator";

import { managers } from "@prisma/client";
import { appError } from "../utils/appError";
import { responseSuccess, responseSuccessData } from "../utils/responseSuccess";
import { ManagerRequest } from "../models/managers.model";
import { prisma } from "../configs/prismaClient";
import { generateAndSendJWT } from "../services/auth/auth.service";

@Tags("Manager")
@Route("/api/managers")
export class ManagersController extends Controller {
  // constructor(private readonly _manager: ManagerDocument) {}
  @Get()
  @SuccessResponse(StatusCodes.OK, "OK")
  public async getAll(
    @Queries() reqQuery: { order?: string; take?: number; skip?: number }
  ) {
    const { order, take, skip } = reqQuery;
    const orderOption = order === "asc" ? "asc" : "desc";
    const takeOption = take || 100;
    const skipOption = skip || 0;

    try {
      const allManagers = await prisma.managers.findMany({
        orderBy: { Id: orderOption },
        take: takeOption,
        skip: skipOption
      });

      return { status: true, allManagers };
    } catch (error: unknown) {
      if (error instanceof Error) throw error;
      throw new Error();
    }
  }

  @Post("generate")
  @SuccessResponse(StatusCodes.CREATED, "CREATED")
  public async generate(@Body() times?: number) {
    try {
      const generatedManagers: managers[] = [];
      for (let i = 0; i < (times || 1); i += 1) {
        const manager = await prisma.managers.create({
          data: {}
        });
        generatedManagers.push(manager);
      }

      return { status: true, generatedManagers };
    } catch (error: unknown) {
      if (error instanceof Error) throw error;
      throw new Error();
    }
  }

  // @Post("signup")
  // public signUp = async (
  //   req: ManagerRequest,
  //   res: Response,
  //   next: NextFunction
  // ) => {
  //   const { Email, Password, ConfirmPassword, UserId } = req.body;

  //   if (!Email || !Password || !ConfirmPassword || !UserId) {
  //     next(appError(StatusCodes.BAD_REQUEST, "All fields are required", next));
  //     return;
  //   }

  //   if (Password !== ConfirmPassword) {
  //     next(appError(StatusCodes.BAD_REQUEST, "Passwords do not match", next));
  //     return;
  //   }

  //   if (!validator.isLength(Password, { min: 8 })) {
  //     next(
  //       appError(
  //         StatusCodes.BAD_REQUEST,
  //         "Password must be at least 8 characters long",
  //         next
  //       )
  //     );
  //     return;
  //   }

  //   if (!validator.isEmail(Email)) {
  //     next(appError(StatusCodes.BAD_REQUEST, "Invalid email format", next));
  //     return;
  //   }

  //   try {
  //     const existingManager = await prisma.managers.findFirst({
  //       where: { Email, UserId }
  //     });

  //     if (existingManager) {
  //       next(appError(StatusCodes.BAD_REQUEST, "Email already exists", next));
  //       return;
  //     }

  //     const UnsignedManager = await prisma.managers.findFirst({
  //       where: {
  //         Email: null,
  //         UserId: null
  //       }
  //     });

  //     if (!UnsignedManager) {
  //       next(
  //         appError(StatusCodes.BAD_REQUEST, "No enough Unsigned Manager", next)
  //       );
  //       return;
  //     }

  //     const hashedPassword = await bcrypt.hash(Password, 12);
  //     const signedManager = await prisma.managers.update({
  //       where: { Id: UnsignedManager.Id },
  //       data: {
  //         Email,
  //         UserId,
  //         Password: hashedPassword
  //       }
  //     });

  //     responseSuccess(res, StatusCodes.CREATED, signedManager);
  //   } catch (error: unknown) {
  //     if (error instanceof Error) throw error;
  //     throw new Error("Unexpected error in managers signUp");
  //   }
  // };

  @Post("signin")
  public signIn = async (
    req: ManagerRequest,
    res: Response,
    next: NextFunction
  ) => {
    // @swagger.tags = ['Manager']
    const { Email, Password } = req.body;

    if (!Email || !Password) {
      next(appError(StatusCodes.BAD_REQUEST, "All fields are required", next));
      return;
    }

    try {
      const manager = await prisma.managers.findUnique({
        where: { Email }
      });
      if (!manager || !manager.Password) {
        next(
          appError(StatusCodes.BAD_REQUEST, "Email or password is not correct")
        );
        return;
      }

      const auth = await bcrypt.compare(Password, manager.Password);
      if (!auth) {
        next(
          appError(StatusCodes.BAD_REQUEST, "Email or password is incorrect")
        );
        return;
      }

      generateAndSendJWT(res, StatusCodes.OK, manager);
    } catch (error: unknown) {
      if (error instanceof Error) throw error;
      throw new Error("Unexpected error in managers signIn");
    }
  };
}
