/* eslint-disable class-methods-use-this */
import { Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcryptjs";
import validator from "validator";

import { appError } from "../utils/appError";
import { responseSuccess } from "../utils/responseSuccess";
import { ManagerRequest } from "../models/managers.model";
import { prisma } from "../configs/prismaClient";
import { generateAndSendJWT } from "../services/auth/auth.service";

export class ManagersController {
  // constructor(private readonly _manager: ManagerDocument) {}

  public getAll = async (req: ManagerRequest, res: Response) => {
    // @swagger.tags = ['Manager']
    const { order, take, skip } = req.query;
    const orderOption = order === "asc" ? "asc" : "desc";
    const takeOption = Number(take || 100);
    const skipOption = Number(skip || 0);

    try {
      const allManagers = await prisma.managers.findMany({
        orderBy: { Id: orderOption },
        take: takeOption,
        skip: skipOption
      });
      responseSuccess(res, StatusCodes.OK, allManagers);
    } catch (error: unknown) {
      if (error instanceof Error) throw error;
    }
  };

  public generate = async (req: ManagerRequest, res: Response) => {
    // @swagger.tags = ['Manager']
    const { times } = req.body;

    try {
      const managers = [];
      for (let i = 0; i < Number(times); i += 1) {
        const manager = await prisma.managers.create({
          data: {}
        });
        managers.push(manager);
      }

      responseSuccess(res, StatusCodes.OK, managers);
    } catch (error: unknown) {
      if (error instanceof Error) throw error;
    }
  };

  public signUp = async (
    req: ManagerRequest,
    res: Response,
    next: NextFunction
  ) => {
    // @swagger.tags = ['Manager']
    const { Email, Password, ConfirmPassword, UserId } = req.body;

    if (!Email || !Password || !ConfirmPassword || !UserId) {
      next(appError(StatusCodes.BAD_REQUEST, "All fields are required", next));
      return;
    }

    if (Password !== ConfirmPassword) {
      next(appError(StatusCodes.BAD_REQUEST, "Passwords do not match", next));
      return;
    }

    if (!validator.isLength(Password, { min: 8 })) {
      next(
        appError(
          StatusCodes.BAD_REQUEST,
          "Password must be at least 8 characters long",
          next
        )
      );
      return;
    }

    if (!validator.isEmail(Email)) {
      next(appError(StatusCodes.BAD_REQUEST, "Invalid email format", next));
      return;
    }

    try {
      const existingManager = await prisma.managers.findFirst({
        where: { Email, UserId }
      });

      if (existingManager) {
        next(appError(StatusCodes.BAD_REQUEST, "Email already exists", next));
        return;
      }

      const UnsignedManager = await prisma.managers.findFirst({
        where: {
          Email: null,
          UserId: null
        }
      });

      if (!UnsignedManager) {
        next(
          appError(StatusCodes.BAD_REQUEST, "No enough Unsigned Manager", next)
        );
        return;
      }

      const hashedPassword = await bcrypt.hash(Password, 12);
      const signedManager = await prisma.managers.update({
        where: { Id: UnsignedManager.Id },
        data: {
          Email,
          UserId,
          Password: hashedPassword
        }
      });

      responseSuccess(res, StatusCodes.CREATED, signedManager);
    } catch (error: unknown) {
      if (error instanceof Error) throw error;
      throw new Error("Unexpected error in managers signUp");
    }
  };

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
